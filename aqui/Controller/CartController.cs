using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using aqui.Data;
using aqui.Dtos;
using aqui.Services.Responses;
using aqui.Services.Validator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace aqui.Controller
{
    [Authorize(Roles = "User")]
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ILogger<CartController> _logger;
        private readonly JwtUserValidator _jwtUserValidator;
        private readonly AquiContext _context;

        public CartController(ILogger<CartController> logger, JwtUserValidator jwtUserValidator, AquiContext context   )
        {
            _logger = logger;
            _jwtUserValidator = jwtUserValidator;
            _context = context;
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
        public IActionResult PostCartItem([FromBody] CartItemDto dto)
        {
            if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }
            // 檢查菜單是否存在，避免後續外鍵錯誤
            var menuExists = _context.Menus.Any(m => m.Id == dto.MenuId);
            if (!menuExists)
            {
                return BadRequest(new ErrorResponse{ Message = $"無此餐點 MenuId: {dto.MenuId}"});
            }

            // 載入購物車與既有項目 (不急需載入 Menu 對象)
            var cart = _context.Carts
                .Include(c => c.Items)
                .FirstOrDefault(c => c.UserId == userId);
            if (cart == null)
            {
               cart = CartDtoExtensions.cartItem(new CartDto { UserId = userId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
                _context.Carts.Add(cart);
                _context.SaveChanges();
            }
            // 檢查是否已有同 MenuId 項目，若有則更新
            var existingItem = cart.Items.FirstOrDefault(i => i.MenuId == dto.MenuId);
            if (existingItem != null)
            {
                int totalQuantity = existingItem.Quantity + dto.Quantity;
                existingItem.Quantity = totalQuantity;
                existingItem.SpicyLevel = dto.SpicyLevel;
                _context.SaveChanges();
                
                var result = CartItemDtoExtensions.FromModel(existingItem);
                return Ok(new ApiResponse<CartItemDto>(result,"更新既有購物車項目成功"));
            }

           var newItem =  CartItemDtoExtensions.ToModel(dto);
            newItem.CartId = cart.Id;
            _context.CartItems.Add(newItem);
            _context.SaveChanges();

            dto.Id = newItem.Id;
            dto.CartId = newItem.CartId;
            dto.Quantity = newItem.Quantity;
            dto.SpicyLevel = newItem.SpicyLevel;
            return Ok(new ApiResponse<CartItemDto>(dto,"新增購物車項目成功"));
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

    }
}