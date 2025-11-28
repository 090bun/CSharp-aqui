using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Models;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace aqui.Dtos
{
    public class UserDto
    {
        public int Id{get; set;}
        public string Name{get; set;}=null!;
        public string Password { get; set; } =null!;
        public string Email { get; set; }=null!;
        public RoleStatus Role { get; set; } =RoleStatus.User;
        public DateTime CreatedAt { get; set; } 
        public DateTime UpdatedAt { get; set; }
        public bool IsAvailable { get; set; }=true;
    }

    public class UserReturnDto
    {
        public int Id{get; set;}
        public string Name{get; set;}=null!;
        public string Email { get; set; }=null!;
        public RoleStatus Role { get; set; } =RoleStatus.User;
        public DateTime CreatedAt { get; set; } 
        public DateTime UpdatedAt { get; set; }
        public bool IsAvailable { get; set; }=true;
    }

    public class UserUpdateDto
    {
        public string Name{get; set;}=null!;
    }

    public class UserNameEmailDto
    {
        public string Name{get; set;}=null!;
        public string Email { get; set; }=null!;
        public bool IsAvailable { get; set; }
    }
public static class UserExtensions{
    //Dtos  Model
    public static User FromModel(this UserDto dto)
    {
        return new User
        {

            Name = dto.Name,
            Password = dto.Password,
            Email = dto.Email,
            Role = dto.Role,
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt,
            IsAvailable = dto.IsAvailable
        };
    }

    //Model => DTO  更新資料(Create 用)
    public static UserDto ToModel(User model)
        {
            return new UserDto
            {
                Id = model.Id,
                Name = model.Name,
                Password = model.Password,
                Email = model.Email,
                Role = model.Role,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
                IsAvailable = model.IsAvailable
            };
        }
    
  public static UserReturnDto ReturnResult(User model)
        {
            return new UserReturnDto
            {
                Id = model.Id,
                Name = model.Name,
                Email = model.Email,
                Role = model.Role,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
                IsAvailable = model.IsAvailable
            };
        }


    //註銷用戶
    public static void UserDeregister(this User model ,UserDeregisterDto dto)
        {
            model.IsAvailable = dto.IsAvailable;
            model.UpdatedAt =DateTime.Now;
        }
    }
}