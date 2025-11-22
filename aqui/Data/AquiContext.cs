using Microsoft.EntityFrameworkCore;
using aqui.Models;

namespace aqui.Data
{
    public class AquiContext : DbContext
    {
        public AquiContext(DbContextOptions<AquiContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = default!;
        public DbSet<Menu> Menus { get; set; } = default!;
        public DbSet<Category> Categories { get; set; } = default!;
        public DbSet<Cart> Carts { get; set; } = default!;
        public DbSet<CartItem> CartItems { get; set; } = default!;
        public DbSet<Order> Orders { get; set; } = default!;
        public DbSet<OrderItem> OrderItems { get; set; } = default!;
        public DbSet<News> News { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Table names
            modelBuilder.Entity<User>().ToTable("user");
            modelBuilder.Entity<Menu>().ToTable("menu");
            modelBuilder.Entity<Category>().ToTable("category");
            modelBuilder.Entity<Cart>().ToTable("cart");
            modelBuilder.Entity<CartItem>().ToTable("cart_items");
            modelBuilder.Entity<Order>().ToTable("order");
            modelBuilder.Entity<OrderItem>().ToTable("order_items");
            modelBuilder.Entity<News>().ToTable("news");

            // User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
            modelBuilder.Entity<User>()
                .Property(u => u.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            // Category
            modelBuilder.Entity<Category>()
                .Property(c => c.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
            modelBuilder.Entity<Category>()
                .Property(c => c.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            // Menu
            modelBuilder.Entity<Menu>()
                .Property(m => m.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
            modelBuilder.Entity<Menu>()
                .Property(m => m.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            modelBuilder.Entity<Menu>()
                .HasOne(m => m.Category)
                .WithMany(c => c.Menus)
                .HasForeignKey(m => m.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cart
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithMany(u => u.Carts)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // CartItem
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Menu)
                .WithMany(m => m.CartItems)
                .HasForeignKey(ci => ci.MenuId)
                .OnDelete(DeleteBehavior.Restrict);

            // Order
            modelBuilder.Entity<Order>()
                .HasAlternateKey(o => o.OrderGuid);
            modelBuilder.Entity<Order>()
                .Property(o => o.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
            modelBuilder.Entity<Order>()
                .Property(o => o.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            // OrderItem
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Menu)
                .WithMany(m => m.OrderItems)
                .HasForeignKey(oi => oi.MenuId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderGuid)
                .HasPrincipalKey(o => o.OrderGuid)
                .OnDelete(DeleteBehavior.Cascade);

            // News
            modelBuilder.Entity<News>()
                .Property(n => n.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
            modelBuilder.Entity<News>()
                .Property(n => n.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }
    }
}