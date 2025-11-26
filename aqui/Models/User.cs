using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using aqui.Dtos;
using Microsoft.EntityFrameworkCore;

namespace aqui.Models
{
    [Table("user")]
    [Index(nameof(Email), IsUnique = true)]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; } =null!;
        public string Password { get; set; } =null!;
        public string Email { get; set; }=null!;
        public RoleStatus Role { get; set; }=RoleStatus.User;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsAvailable { get; set; }=true;

        public ICollection<Cart> Carts { get; set; } = new List<Cart>();

        internal void ApplyTo(UserDto dto)
        {
            if (dto == null)
            return;

            if (!string.IsNullOrWhiteSpace(dto.Name))
                Name = dto.Name;
            UpdatedAt =  DateTime.Now;
        }

        internal void ApplyTo(UserUpdateDto dto)
        {
            if (dto == null)
                return;

            if (!string.IsNullOrWhiteSpace(dto.Name))
                Name = dto.Name;
            
            UpdatedAt = DateTime.Now;
        }

        internal void UserDeregister(UserDto dto)
        {
            if (dto == null)
            return; 
            if (!string.IsNullOrWhiteSpace(dto.IsAvailable.ToString()))
                IsAvailable = false;
            UpdatedAt =  DateTime.Now;
        }
    }
}
