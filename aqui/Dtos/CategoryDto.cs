using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Models;

namespace aqui.Dtos
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

public class CategoryMenuDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
    }
    public static class CategoryDtoExtensions
    {
        public static CategoryDto FromModel(Category model)
        {
            return new CategoryDto
            {
                Id = model.Id,
                Name = model.Name,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt
            };
        }
        public static Category ToModel(CategoryDto dto)
        {
            return new Category
            {
                Name = dto.Name
            };
        }
        public static void FixCategory(this Category model, CategoryDto dto)
        {
            model.Name = dto.Name;
        }

        public static CategoryMenuDto ToDto(Category model)
        {
            return new CategoryMenuDto
            {
                Id = model.Id,
                Name = model.Name
            };
        }

    }
}