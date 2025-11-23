using System;
using System.Collections.Generic;
using System.Linq;
using aqui.Models;

namespace aqui.Dtos
{
    // 僅含安全欄位，避免外洩密碼
    public class UserBasicDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public bool IsAvailable { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserIdOrderDto
    {
        public int UserId { get; set; }
        public UserBasicDto User { get; set; } = new UserBasicDto();
        public List<OrderDto> Orders { get; set; } = new List<OrderDto>();
    }

    public static class UserIdOrderDtoExtensions
    {
        public static UserIdOrderDto FromModel(User user, IEnumerable<Order> orders)
        {
            return new UserIdOrderDto
            {
                UserId = user.Id,
                User = new UserBasicDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    IsAvailable = user.IsAvailable,
                    CreatedAt = user.CreatedAt
                },
                Orders = orders.Select(OrderDtoExtensions.FromModel).ToList()
            };
        }
    }
}