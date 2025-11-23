using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Models;

namespace aqui.Dtos
{
    public class OrderDto
    {
        public Guid OrderGuid { get; set; }
        public int UserId { get; set;}
        public OrderStatus  Status { get; set; } 
        public int TotalPrice { get; set; }
        public int TotalQuantity { get; set; }
        public bool NeedUtensils { get; set; } 
        public DateTime PickupTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<OrderItemDto>? Items { get; set; } = new List<OrderItemDto>();
    }
    public class OrderSoldDto
    {
        public Guid OrderGuid { get; set; }
        public int UserId { get; set;}
        public OrderStatus  Status { get; set; } 
        public int TotalPrice { get; set; }
        public int TotalQuantity { get; set; }
        public DateTime UpdatedAt { get; set; }
        }
    public static class OrderDtoExtensions
    {
        public static OrderDto FromModel(Order order)
        {
            return new OrderDto
            {
                OrderGuid = order.OrderGuid,
                UserId = order.UserId,
                Status = order.Status,
                TotalPrice = order.TotalPrice,
                TotalQuantity = order.TotalQuantity,
                NeedUtensils = order.NeedUtensils,
                PickupTime = order.PickupTime,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                Items = order.Items.Select(item => OrderItemDtoExtensions.ToModel(item)).ToList()
            };
        }

public static OrderSoldDto Sold(Order order)
        {
            return new OrderSoldDto
            {
                OrderGuid = order.OrderGuid,
                UserId = order.UserId,
                Status = order.Status,
                TotalPrice = order.TotalPrice,
                TotalQuantity = order.TotalQuantity,
                UpdatedAt = order.UpdatedAt
                };
        }

        public static Order ToModel(OrderDto dto)
        {
            return new Order
            {
                OrderGuid = dto.OrderGuid,
                UserId = dto.UserId,
                Status = dto.Status,
                TotalPrice = dto.TotalPrice,
                TotalQuantity = dto.TotalQuantity,
                NeedUtensils = dto.NeedUtensils,
                PickupTime = dto.PickupTime,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
                Items = dto.Items?.Select(item => OrderItemDtoExtensions.FromModel(item)).ToList() ?? new List<OrderItem>()
            };
        }

    }
}