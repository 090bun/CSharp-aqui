using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using aqui.Data;
using aqui.Dtos;
using aqui.Models;
using aqui.Services.Responses;
using aqui.Services.Validator;
using aqui.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace aqui.Controller
{
    [Authorize]
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ILogger<CartController> _logger;
        private readonly JwtUserValidator _jwtUserValidator;
        private readonly AquiContext _context;
        private readonly OrderPricingService _pricingService;

        public CartController(ILogger<CartController> logger, JwtUserValidator jwtUserValidator, AquiContext context, OrderPricingService pricingService   )
        {
            _logger = logger;
            _jwtUserValidator = jwtUserValidator;
            _context = context;
            _pricingService = pricingService;
        }

        //取得購物車資料
        [HttpGet]
        public IActionResult GetCart()
        {
            if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }
            var cart = _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Menu)
                .FirstOrDefault(c => c.UserId == userId);
            if (cart == null)
            {
                return NotFound(new ErrorResponse{ Message="購物車不存在"});
            }
            var result = CartDtoExtensions.FromModel(cart);
            return Ok(new ApiResponse<CartDto>(result,"查詢成功"));
        }

        //新增購物車項目
        [HttpPost]
        public IActionResult PostCartItem([FromBody] List<CartItemDto> dtoList)
        {
            if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }
            
            if (dtoList == null || !dtoList.Any())
            {
                return BadRequest(new ErrorResponse{ Message = "購物車項目不能為空" });
            }
            
            // 檢查菜單是否存在，避免後續外鍵錯誤
            var invalidMenuIds = dtoList.Where(d => !_context.Menus.Any(m => m.Id == d.MenuId))
                                        .Select(d => d.MenuId)
                                        .ToList();
            if (invalidMenuIds.Any())
            {
                return BadRequest(new ErrorResponse{ Message = $"餐點不存在: {string.Join(", ", invalidMenuIds)}" });
            }

            // 載入購物車與既有項目
            var cart = _context.Carts
                .Include(c => c.Items)
                .FirstOrDefault(c => c.UserId == userId);
            if (cart == null)
            {
               cart = CartDtoExtensions.cartItem(new CartDto { UserId = userId, CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now });
                _context.Carts.Add(cart);
                _context.SaveChanges();
            }
            
            var resultList = new List<CartItemDto>();
            
            // 逐一處理每個購物車項目
            foreach (var dto in dtoList)
            {
                // 檢查是否已有同 MenuId 項目，若有則更新
                var existingItem = cart.Items.FirstOrDefault(i => i.MenuId == dto.MenuId);
                if (existingItem != null)
                {
                    existingItem.Quantity += dto.Quantity;
                    existingItem.SpicyLevel = dto.SpicyLevel;
                    resultList.Add(CartItemDtoExtensions.FromModel(existingItem));
                }
                else
                {
                    // 新增項目
                    var newItem = CartItemDtoExtensions.ToModel(dto);
                    newItem.CartId = cart.Id;
                    _context.CartItems.Add(newItem);
                    _context.SaveChanges();
                    
                    dto.Id = newItem.Id;
                    dto.CartId = newItem.CartId;
                    resultList.Add(dto);
                }
            }
            
            _context.SaveChanges();
            return Ok(new ApiResponse<List<CartItemDto>>(resultList, "新增購物車項目成功"));
        }


        //刪除購物車項目
        [HttpDelete]
        public IActionResult DeleteCartItems()
        {
            if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }
            var cart = _context.Carts
                .Include(c => c.Items)
                .FirstOrDefault(c => c.UserId == userId);
            if (cart == null)
            {
                return NotFound(new ErrorResponse{ Message = "購物車不存在"});
            }
            var cartItems = cart.Items.Where(i => i.CartId == cart.Id).ToList();
            _context.Carts.Remove(cart);
            _context.CartItems.RemoveRange(cartItems);
            _context.SaveChanges();
            return Ok(new ApiResponse<int>(cart.Id,"刪除購物車項目成功"));
        }

        //更新購物車項目
        [HttpPatch]
public IActionResult FixCartItem([FromBody] FixCartItemDto dto)
{
    if (!_jwtUserValidator.TryGetUserId(User, out int userId))
    {
        return BadRequest(new ErrorResponse { Message = $"錯誤或不合法ID: {userId}" });
    }

    var cart = _context.Carts
        .Include(c => c.Items)
        .FirstOrDefault(c => c.UserId == userId);

    if (cart == null)
    {
        return NotFound(new ErrorResponse { Message = "購物車不存在" });
    }

    var existingItem = cart.Items.FirstOrDefault(i => i.MenuId == dto.MenuId);
    if (existingItem == null)
    {
        return NotFound(new ErrorResponse { Message = $"購物車項目不存在 MenuId: {dto.MenuId}" });
    }

    existingItem.Quantity = dto.Quantity;
    existingItem.SpicyLevel = dto.SpicyLevel;

    _context.SaveChanges();

    return Ok(new ApiResponse<FixCartItemDto>(dto, "更新購物車項目成功"));
}

        //確認付款
        [HttpPost("checkout")]
        public IActionResult Checkout([FromBody] CheckoutDto dto)
        {
            if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse { Message = $"錯誤或不合法ID: {userId}" });
            }

            var cart = _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Menu)
                .FirstOrDefault(c => c.UserId == userId);
            if (cart == null || !cart.Items.Any())
            {
                return BadRequest(new ErrorResponse { Message = "購物車為空，無法結帳" });
            }

            var pickupTime = dto.PickupTime;
            var utensils = dto.Utensils;

            // 嘗試取得使用者的現有訂單；若沒有就建立一筆新訂單
            var orderData = _context.Orders
                .Include(o => o.Items)
                .FirstOrDefault(od => od.UserId == userId);

            
                orderData = new Order
                {
                    OrderGuid = Guid.NewGuid(),
                    UserId = userId,
                    Status = OrderStatus.Pending,
                    PickupTime = pickupTime,
                    NeedUtensils = utensils,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.Orders.Add(orderData);
                _context.SaveChanges();

            // 由服務負責從 Menu 撈資料與計算金額
            var pricingResult = _pricingService.BuildOrderItems(orderData, cart);
            if (pricingResult.Error != null)
            {
                return BadRequest(pricingResult.Error);
            }
            foreach (var orderItem in pricingResult.Items)
            {
                _context.OrderItems.Add(orderItem);
            }
            orderData.TotalPrice = pricingResult.TotalPrice;
            orderData.TotalQuantity = pricingResult.TotalQuantity;

            // 結帳後清空購物車
            _context.CartItems.RemoveRange(cart.Items);
            _context.Carts.Remove(cart);
            _context.SaveChanges();

            return Ok(new ApiResponse<object>(
                new
                {
                    OrderId = orderData.Id,
                    OrderGuid = orderData.OrderGuid,
                    TotalPrice = orderData.TotalPrice,
                    TotalQuantity = orderData.TotalQuantity
                },
                "進入結帳環節，購物車已清空並建立訂單項目"));
        }

    }
}