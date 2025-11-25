using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Dtos;
using aqui.Models;

namespace aqui.Dtos
{
    public class MenuDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Price { get; set; }
        public string? Image { get; set; }
        public string Category { get; set; } = string.Empty; 
        public bool IsAvailable { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set;
        }
    }
   


public static class MenuExtensions{
    //Model → DTO
    public static MenuDto ToDto(this Menu model)
    {
        return new MenuDto
        {
            Id = model.Id,
            Name = model.Name,
            Description = model.Description,
            Price = model.Price,
            Image = model.Image,
            Category = model.Category?.Name ?? string.Empty,
            IsAvailable = model.IsAvailable,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };
    }


    //DTO → Model (Create 用)
    public static Menu ToModel(this MenuDto dto, int categoryId)
    {
        return new Menu
        {
            Name = dto.Name,
            Description = dto.Description ?? "",
            Price = dto.Price,
            Image = dto.Image ?? "",
            CategoryId = categoryId,
            IsAvailable = dto.IsAvailable,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };
    }


//DTO 套用至 Model (Patch 用)
    public static void ApplyTo(this Menu model, MenuDto dto, int categoryId)
    {
        model.Id = model.Id;
        model.Name = dto.Name ?? model.Name;
        model.Description = dto.Description ?? model.Description;
        model.Price = dto.Price;
        model.Image = dto.Image ?? model.Image;
        model.CategoryId = categoryId;
        model.IsAvailable = dto.IsAvailable;
        model.UpdatedAt = DateTime.Now;
    }

    public static void Close(this Menu model, MenuCloseDto dto)
    {
        model.IsAvailable = dto.IsAvailable;
        model.UpdatedAt = DateTime.Now;
    }

}

}