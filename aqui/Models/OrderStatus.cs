using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace aqui.Models
{
    public enum OrderStatus
{
    OutOfStock,     // 品項不足
    Pending,        // 待確認
    Confirmed,      // 已確認
    PickedUp,       // 已取餐
    Completed,      // 已完成
    Cancelled       // 取消訂單
}
}