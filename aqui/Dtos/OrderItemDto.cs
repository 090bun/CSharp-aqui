using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Models;

namespace aqui.Dtos
{
    public class OrderItemDto
    {
        public int MenuId { get; set; }
        public int Quantity { get; set;}
        public int Price { get; set; }
        public int Subtotal { get; set; }
    }

    public static class OrderItemDtoExtensions
    {
        public static OrderItem FromModel(OrderItemDto dto)
        {
            return new OrderItem
            {
                MenuId = dto.MenuId,
                Quantity = dto.Quantity,
                Price = dto.Price,
                Subtotal = dto.Subtotal
            };
        }

        public static OrderItemDto ToModel(OrderItem item)
        {
            return new OrderItemDto
            {
                MenuId = item.MenuId,
                Quantity = item.Quantity,
                Price = item.Price,
                Subtotal = item.Subtotal
            };
        }
    }
}