using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using aqui.Data;
using aqui.Dtos;
using aqui.Models;
using aqui.Services.Responses;
using aqui.Services.Validator;
using aqui.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace aqui.Controller
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ILogger<CategoryController> _logger;
        private readonly JwtUserValidator _jwtUserValidator;
        private readonly AquiContext _context;


        public CategoryController(ILogger<CategoryController> logger, JwtUserValidator jwtUserValidator, AquiContext context)
        {
            _logger = logger;
            _jwtUserValidator = jwtUserValidator;
            _context = context;
        }

        //取得種類
        [HttpGet]
        public IActionResult GetCategory()
        {
            var model = _context.Categories.ToList();
            if (model == null)
            {
                return NotFound(new ErrorResponse { Message = "沒有分類資料" });
            }
            var result = model.Select(n => CategoryDtoExtensions.FromModel(n)).ToList();
            return Ok(new ApiResponse<List<CategoryDto>>(result, "查詢成功"));
        }

        //新增種類
        [HttpPost]
        public IActionResult PostCategory(CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new ErrorResponse { Message = "名稱不可為空" });
            }
            if (_context.Categories.Any(c => c.Name == dto.Name))
            {
                return Conflict(new ErrorResponse { Message = "種類名稱已存在" });
            }

            var category = CategoryDtoExtensions.ToModel(dto);
            _context.Categories.Add(category);
            _context.SaveChanges();

            var result = CategoryDtoExtensions.FromModel(category);
            return Ok(new ApiResponse<CategoryDto>(result, "新增成功"));
        }

        //修改種類資料
        [HttpPatch("{id}")]
        public IActionResult UpdateCategory([FromRoute]int id,[FromBody] CategoryDto dto)
        {
            var category = _context.Categories.FirstOrDefault(n => n.Id == id);
            if (category == null)
            {
                return NotFound(new ErrorResponse { Message = "種類不存在" });
            }
            category.FixCategory(dto);
            category.UpdatedAt = DateTime.Now;
            _context.SaveChanges();
            var result = CategoryDtoExtensions.FromModel(category);
            return Ok(new ApiResponse<CategoryDto>(result, "修改成功"));
        }

        //刪除種類
        [HttpPatch("delete/{id}")]
        public IActionResult DeleteCategory([FromRoute]int id)
        {
            var category = _context.Categories.FirstOrDefault(n => n.Id == id);
            if (category == null)
            {
                return NotFound(new ErrorResponse { Message = "種類不存在" });
            }
            category.DeletedAt = DateTime.Now;
            _context.Update(category);
            _context.SaveChanges();
            var result = CategoryDtoExtensions.FromModel(category);
            return Ok(new ApiResponse<CategoryDto>(result, "刪除成功"));
        }
    }
}