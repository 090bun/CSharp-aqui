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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace aqui.Controller
{   [Authorize(Roles = "Admin")]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly ILogger<MenuController> _logger;
        private readonly Data.AquiContext _context;
        public MenuController(ILogger<MenuController> logger, Data.AquiContext context)
        {
            _logger = logger;
            _context = context;
        }


        //取得所有菜單內容
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetMenus()
        {
            _logger.LogInformation("Fetching all menus");
            var menus = _context.Menus
        .Include(m => m.Category)  // 加入 Category 導航屬性
        .Where(x => x.IsAvailable == true)
        .Select(m => m.ToDto())
        .ToList();

    return Ok(new ApiResponse<List<MenuDto>>(menus, "查詢成功"));
        }

        //新增菜單內容
        [HttpPost]
        public IActionResult CreateMenu([FromBody] MenuDto  dto)
        {
            _logger.LogInformation("Creating a new menu item");
            var validationResult = MenuValidator.ValidateMenu(dto);
            if (validationResult != null)
            {
                return BadRequest(new ErrorResponse { Message = validationResult.Message });
            }
            var (isValid, categoryId) = CategoryTypeValidator.IsValidCategory(_context, dto.Category);
    if (!isValid)
        return BadRequest(new ErrorResponse { Message = "無效的菜單類別" });

    var model = dto.ToModel(categoryId);

    _context.Menus.Add(model);
    _context.SaveChanges();

    return CreatedAtAction(nameof(GetMenus),
        new { id = model.Id },
        new ApiResponse<MenuDto>(model.ToDto(), "菜單新增成功"));
        }

        //修改菜單內容
        [HttpPatch]
        public IActionResult PatchMenu([FromBody] MenuDto dto)
        {
            _logger.LogInformation("Updating a menu item");
           var menu = _context.Menus.FirstOrDefault(x => x.Id == dto.Id);
            if (menu == null)
                return NotFound(new ErrorResponse { Message = "菜單不存在" });

            var validate = MenuValidator.ValidateMenu(dto);
            if (validate != null)
                return BadRequest(validate);

            var (isValid, categoryId) = CategoryTypeValidator.IsValidCategory(_context, dto.Category);
            if (!isValid)
                return BadRequest(new ErrorResponse { Message = "無效的菜單類別" });

            menu.ApplyTo(dto, categoryId);
            _context.SaveChanges();

            return Ok(new ApiResponse<MenuDto>(menu.ToDto(), "菜單更新成功"));
        }
        
        //關閉菜單 (可傳LIST)IsAvailable = false
        [HttpPatch("close")]
        public IActionResult CloseMenu([FromBody] List<MenuCloseDto> dto)
        {
            var ids = dto.Select(x => x.Id).ToList();
            var menus = _context.Menus.Where(x => ids.Contains(x.Id)).ToList();

            if (!menus.Any())
                return NotFound(new ErrorResponse { Message = "菜單不存在" });

            foreach (var menu in menus)
            {
                var input = dto.First(d => d.Id == menu.Id);
                menu.IsAvailable = false;
                menu.UpdatedAt = DateTime.Now;
            }

            _context.SaveChanges();

            return Ok(new ApiResponse<List<MenuDto>>(
                menus.Select(m => m.ToDto()).ToList(), 
                "菜單更新成功"));
        }
    }
}