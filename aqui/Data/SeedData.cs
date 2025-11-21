using Microsoft.EntityFrameworkCore;

namespace aqui.Data
{
    public class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new AquiContext(
                serviceProvider.GetRequiredService<
                    DbContextOptions<AquiContext>>()))
            {
                // Users
                if (!context.Users.Any())
                {
                    var password_1 = BCrypt.Net.BCrypt.HashPassword("adminpass");
                    var password_2 = BCrypt.Net.BCrypt.HashPassword("userpass");
                    context.Users.AddRange(
                        new Models.User
                        {
                            Name = "Admin User",
                            Email = "admin@example.com",
                            Password = password_1,
                            Role = "Admin",
                            CreatedAt = DateTime.Now,
                            IsAvailable = true
                        },
                        new Models.User
                        {
                            Name = "Regular User",
                            Email = "user@example.com",
                            Password = password_2,
                            Role = "User",
                            CreatedAt = DateTime.Now,
                            IsAvailable = true
                        }
                    );
                    context.SaveChanges();
                }

                // Categories
                if (!context.Categories.Any())
                {
                    context.Categories.AddRange(
                        new Models.Category { Id = 1, Name = "套餐", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now },
                        new Models.Category { Id = 2, Name = "主餐", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now },
                        new Models.Category { Id = 3, Name = "湯品", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now },
                        new Models.Category { Id = 4, Name = "小菜", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now }
                    );
                    context.SaveChanges();
                }

                // Menus
                if (!context.Menus.Any())
                {
                    context.Menus.AddRange(
                        new Models.Menu
                        {
                            Name = "一號餐",
                            Description = "這是一號餐的描述。",
                            Price = 105,
                            CategoryId = 1,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now,
                            IsAvailable = true,
                            Image = ""
                        },
                        new Models.Menu
                        {
                            Name = "滷肉飯",
                            Description = "",
                            Price = 65,
                            CategoryId = 2,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now,
                            IsAvailable = true,
                            Image = ""
                        }
                    );
                    context.SaveChanges();
                }

                // Orders
                if (!context.Orders.Any())
                {
                    context.Orders.AddRange(
                        new Models.Order
                        {
                            OrderGuid = Guid.NewGuid(),
                            TotalPrice = 200,
                            Status = Models.OrderStatus.Pending,
                            TotalQuantity = 2,
                            PickupTime = DateTime.Now.AddHours(2),
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        },
                        new Models.Order
                        {
                            OrderGuid = Guid.NewGuid(),
                            TotalPrice = 150,
                            Status = Models.OrderStatus.Confirmed,
                            TotalQuantity = 1,
                            PickupTime = DateTime.Now.AddHours(1),
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        }
                    );
                    context.SaveChanges();
                }

                // Order Items
                if (!context.OrderItems.Any() && context.Orders.Any())
                {
                    var orders = context.Orders.ToList();
                    context.OrderItems.AddRange(
                        new Models.OrderItem
                        {
                            OrderGuid = orders.First().OrderGuid,
                            MenuId = 1,
                            Quantity = 2,
                            Price = 105,
                            Subtotal = 210,
                            Spicy = true,
                        },
                        new Models.OrderItem
                        {
                            OrderGuid = orders.Skip(1).First().OrderGuid,
                            MenuId = 2,
                            Quantity = 1,
                            Price = 65,
                            Subtotal = 65,
                            Spicy = false,
                        }
                    );
                    context.SaveChanges();
                }

                // News
                if (!context.News.Any())
                {
                    context.News.AddRange(
                        new Models.News
                        {
                            Title = "Welcome to Aqui!",
                            Content = "We are excited to launch our new food ordering platform. Stay tuned for delicious updates!",
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        },
                        new Models.News
                        {
                            Title = "New Menu Items Added",
                            Content = "Check out our latest additions to the menu, featuring seasonal specialties and customer favorites.",
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        }
                    );
                    context.SaveChanges();
                }
            }
        }
    }
}