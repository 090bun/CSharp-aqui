using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aqui.Models
{
    [Table("order")]
    public class Order
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public Guid OrderGuid { get; set; }
        public int UserId { get; set; }
        public OrderStatus  Status { get; set; } = OrderStatus.Pending;
        public int TotalPrice { get; set; }
        public int TotalQuantity { get; set; }
        public bool NeedUtensils { get; set; } = true;
        public DateTime PickupTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        

        public User? User { get; set; }
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }


}
