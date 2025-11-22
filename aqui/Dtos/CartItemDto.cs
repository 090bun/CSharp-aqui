using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Models;

namespace aqui.Dtos
{
    public class CartItemDto
    {
         public int Id { get; set; }
        public int CartId { get; set; }
        public int MenuId { get; set; }
        public int Quantity { get; set; } = 1;
        public int SpicyLevel { get; set; } = 0;
    }
    public static class CartItemDtoExtensions
    {
        public static CartItem ToModel(CartItemDto dto)
        {
            return new CartItem
            {
                CartId = dto.CartId,
                MenuId = dto.MenuId,
                Quantity = dto.Quantity,
                SpicyLevel = dto.SpicyLevel
            };
        }

        public static CartItemDto FromModel(CartItem item)
        {
            return new CartItemDto
            {
                Id = item.Id,
                CartId = item.CartId,
                MenuId = item.MenuId,
                Quantity = item.Quantity,
                SpicyLevel = item.SpicyLevel
            };
        }
    }
}
