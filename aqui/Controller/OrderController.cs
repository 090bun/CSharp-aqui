using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using aqui.Data;
using aqui.Dtos;
using aqui.Services;
using aqui.Services.Responses;
using aqui.Services.Validator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using aqui.Models;
using Microsoft.EntityFrameworkCore;

namespace aqui.Controller
{
    [Authorize(Roles = "Admin,User")]
    [ApiController]
    [Route("api/v1/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly ILogger<OrderController> _logger;
        private readonly AquiContext _context;
        private readonly JwtUserValidator _jwtUserValidator;
        public OrderController(ILogger<OrderController> logger, JwtUserValidator jwtUserValidator, AquiContext context)
        {
            _logger = logger;
            _jwtUserValidator = jwtUserValidator;
            _context = context;
        }

// 取得訂單資料(可依狀態與時間篩選)
[HttpGet]
public IActionResult Get(
    [FromQuery] OrderStatus? status,
    [FromQuery] DateTime? start,
    [FromQuery] DateTime? end,
    [FromQuery] string? by // 可為: CreatedAt(預設), PickupTime, UpdatedAt
)
{
    if (!_jwtUserValidator.TryGetUserId(User, out int userId))
    {
        return BadRequest(new ErrorResponse { Message = $"錯誤或不合法ID: {userId}" });
    }

    var query = _context.Orders
        .Where(o => o.UserId == userId)
        .Include(o => o.Items)
        .AsQueryable();

    // 狀態篩選：未指定時
    if (status.HasValue)
    {
        query = query.Where(o => o.Status == status.Value);
    }

    // 時間範圍（包含端點日的整天）
    if (start.HasValue || end.HasValue)
    {
        var s = start ?? DateTime.MinValue;
        var e = (end?.Date.AddDays(1).AddTicks(-1)) ?? DateTime.MaxValue;
        if (s > e)
        {
            return BadRequest(new ErrorResponse { Message = "時間範圍無效：start 必須早於或等於 end" });
        }

        if (string.Equals(by, "PickupTime", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.PickupTime >= s && o.PickupTime <= e);
        }
        else if (string.Equals(by, "UpdatedAt", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.UpdatedAt >= s && o.UpdatedAt <= e);
        }
        else
        {
            query = query.Where(o => o.CreatedAt >= s && o.CreatedAt <= e);
        }
    }

    var data = query.ToList();
    var result = data.Select(OrderDtoExtensions.FromModel).ToList();
    return Ok(new ApiResponse<List<OrderDto>>(result, "查詢成功"));
}


[HttpGet("{orderGuid}")]
public IActionResult GetById(Guid orderGuid)
        {
            if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }

            var order = _context.Orders
                .Include(o => o.Items)
                .FirstOrDefault(o => o.OrderGuid == orderGuid && o.UserId == userId);
            if (order == null)
            {
                return NotFound(new ErrorResponse{Message="找不到符合條件的訂單"});
            }

            var resultDto = OrderDtoExtensions.FromModel(order);
            return Ok(new ApiResponse<OrderDto>(resultDto, "查詢成功"));
        }


//更改訂單狀態
[HttpPatch]
public IActionResult UpdateOrderStatus([FromBody] OrderDto orderDto)
        {
            if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }

            var order = _context.Orders
                .FirstOrDefault(o => o.UserId == userId && (int)o.Status != 5 );
            if (order == null)
            {
                return NotFound(new ErrorResponse{Message="找不到符合條件的訂單"});
            }
            // 確保服務層使用正確的 UserId 進行角色判斷
            orderDto.UserId = userId;

            OrderService orderService = new OrderService(_context);
            Order updatedOrder;
            try
            {
                updatedOrder = orderService.OrderRole(order, orderDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ErrorResponse{Message=ex.Message});
            }
            _context.Orders.Update(updatedOrder);
            _context.SaveChanges();

            var resultDto = OrderDtoExtensions.FromModel(updatedOrder);
            return Ok(new ApiResponse<OrderDto>(resultDto, "訂單狀態更新成功"));
        }


//取得營業額 可以時間查詢
// 取得訂單資料(可依狀態與時間篩選)
[Authorize(Roles = "Admin")]
[HttpGet("sold")]
public IActionResult GetSold(
    [FromQuery] OrderStatus? status,
    [FromQuery] DateTime? start,
    [FromQuery] DateTime? end,
    [FromQuery] string? by // 可為: CreatedAt(預設), PickupTime, UpdatedAt
)
{
    var query = _context.Orders
        .Include(o => o.Items)
        .AsQueryable();

    // 狀態篩選：未指定時
    if (status.HasValue)
    {
        query = query.Where(o => o.Status == status.Value);
    }

    // 時間範圍（包含端點日的整天）
    if (start.HasValue || end.HasValue)
    {
        var s = start ?? DateTime.MinValue;
        var e = (end?.Date.AddDays(1).AddTicks(-1)) ?? DateTime.MaxValue;
        if (s > e)
        {
            return BadRequest(new ErrorResponse { Message = "時間範圍無效：start 必須早於或等於 end" });
        }

        if (string.Equals(by, "PickupTime", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.PickupTime >= s && o.PickupTime <= e);
        }
        else if (string.Equals(by, "UpdatedAt", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.UpdatedAt >= s && o.UpdatedAt <= e);
        }
        else
        {
            query = query.Where(o => o.CreatedAt >= s && o.CreatedAt <= e);
        }
    }

    var data = query.ToList();
    var result = data.Select(OrderDtoExtensions.Sold).ToList();
    return Ok(new ApiResponse<List<OrderSoldDto>>(result, "查詢成功"));
}

    }
}