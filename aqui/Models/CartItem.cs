using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aqui.Models
{
    [Table("cart_items")]
    public class CartItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int CartId { get; set; }
        public int MenuId { get; set; }
        public int Quantity { get; set; }
        public int SpicyLevel { get; set; }

        public Cart? Cart { get; set; }
        public Menu? Menu { get; set; }
    }
}
