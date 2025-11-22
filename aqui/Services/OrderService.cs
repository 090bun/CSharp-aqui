using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Data;
using aqui.Dtos;
using aqui.Models;

namespace aqui.Services
{
    public  class OrderService
    {
        private readonly AquiContext _context;
        public OrderService(AquiContext context)
        {
            _context = context;
        }
        //處理定單相關邏輯
        public Order OrderRole(Order model, OrderDto dto)
        {
            var role = _context.Users
                .Where(u => u.Id == dto.UserId)
                .Select(u => u.Role)
                .FirstOrDefault();

            // 一般使用者：只能取消訂單
            if (role == RoleStatus.User)
            {
                if (dto.Status == OrderStatus.Cancelled)
                {
                    model.Status = OrderStatus.Cancelled;
                    model.UpdatedAt = DateTime.Now;
                    return model;
                }
                throw new InvalidOperationException("一般使用者僅能將訂單狀態改為取消");
            }

            // 管理員：可更新為任何狀態
            if (role == RoleStatus.Admin)
            {
                model.Status = dto.Status;
                model.UpdatedAt = DateTime.Now;
                return model;
            }

            // 未知角色：不變更
            return model;
        }
    }
}