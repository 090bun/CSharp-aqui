using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Models;

namespace aqui.Dtos
{
    public class CartDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
    }
    public static class CartDtoExtensions
    {
        public static Cart cartItem(CartDto dto)
        {
            return new Cart
            {
                UserId = dto.UserId,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
                Items = dto.Items.Select(itemDto => new CartItem
                {
                    CartId = itemDto.CartId,
                    MenuId = itemDto.MenuId,
                    Quantity = itemDto.Quantity,
                    SpicyLevel = itemDto.SpicyLevel
                }).ToList()
            };
        }
        public static CartDto FromModel(Cart cart)
        {
            return new CartDto
            {
                UserId = cart.UserId,
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
                Items = cart.Items.Select(item => new CartItemDto
                {
                    CartId = item.CartId,
                    MenuId = item.MenuId,
                    Quantity = item.Quantity,
                    SpicyLevel = item.SpicyLevel
                }).ToList()
            };
        }

    }
}