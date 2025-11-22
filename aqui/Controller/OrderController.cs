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

//取得訂單資料
    [HttpGet]
    public IActionResult Get()
        {
             if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }
            var data = _context.Orders
                .Where(o => o.UserId == userId&& o.Status != OrderStatus.Cancelled)
                .ToList();
            
var Result = data.Select(OrderDtoExtensions.FromModel).ToList();
            return Ok(new ApiResponse<List<OrderDto>>(Result, "查詢成功"));
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


    }
}