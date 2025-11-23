using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aqui.Models
{
    [Table("order_items")]
    public class OrderItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public Guid OrderGuid { get; set; }
        public int MenuId { get; set; }
        public int Quantity { get; set; }
        public int Price { get; set; }
        public int Subtotal { get; set; }
        public bool Spicy { get; set; } = false;

        public Order? Order { get; set; }
        public Menu? Menu { get; set; }
        
    }
}
