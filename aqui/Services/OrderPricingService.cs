using System.Collections.Generic;
using System.Linq;
using aqui.Data;
using aqui.Models;
using aqui.Services.Responses;

namespace aqui.Services
{
    public class OrderPricingService
    {
        private readonly AquiContext _context;

        public OrderPricingService(AquiContext context)
        {
            _context = context;
        }

        public (List<OrderItem> Items, int TotalPrice, int TotalQuantity, ErrorResponse? Error) BuildOrderItems(Order order, Cart cart)
        {
            var items = new List<OrderItem>();
            int totalPrice = 0;
            int totalQuantity = 0;

            foreach (var cartItem in cart.Items)
            {
                var menu = cartItem.Menu ?? _context.Menus.FirstOrDefault(m => m.Id == cartItem.MenuId);
                if (menu == null)
                {
                    return (new List<OrderItem>(), 0, 0, new ErrorResponse { Message = $"購物車項目缺少對應餐點 MenuId: {cartItem.MenuId}" });
                }
                int unitPrice = menu.Price;
                int subtotal = unitPrice * cartItem.Quantity;
                var orderItem = new OrderItem
                {
                    OrderGuid = order.OrderGuid,
                    MenuId = cartItem.MenuId,
                    Quantity = cartItem.Quantity,
                    Price = unitPrice,
                    Subtotal = subtotal,
                    Spicy = cartItem.SpicyLevel > 0
                };
                items.Add(orderItem);
                totalPrice += subtotal;
                totalQuantity += cartItem.Quantity;
            }

            return (items, totalPrice, totalQuantity, null);
        }
    }
}