using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace aqui.Dtos
{
    public class MenuAndCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public int Price { get; set;  }
        public string Category { get; set;} = string.Empty;
        public bool IsAvailable { get; set;  }
        public CategoryMenuDto? Categories { get; set;  }
    }


    public static class MenuAndCategoryDtoExtensions
    {
        public static MenuAndCategoryDto ToMenuAndCategoryDto(this aqui.Models.Menu model)
        {
            return new MenuAndCategoryDto
            {
                Id = model.Id,
                Name = model.Name,
                Image = model.Image,
                Price = model.Price,
                Category = model.Category != null ? model.Category.Name : string.Empty,
                IsAvailable = model.IsAvailable,
                Categories = model.Category != null && model.Category.DeletedAt == null 
                    ? CategoryDtoExtensions.ToDto(model.Category) 
                    : null
            };
        }
    }
}