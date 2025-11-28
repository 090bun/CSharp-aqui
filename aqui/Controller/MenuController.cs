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

        //取得所有菜單品項和未被軟刪除的種類
        [AllowAnonymous]
        [HttpGet("with-categories")]
        public IActionResult GetMenusWithCategories()
        {
            _logger.LogInformation("Fetching all menus with active categories");
            
            var menus = _context.Menus
                .Include(m => m.Category)
                .Where(m => m.Category != null && m.Category.DeletedAt == null && m.IsAvailable == true)
                .Select(m => m.ToMenuAndCategoryDto())
                .ToList();

            return Ok(new ApiResponse<List<MenuAndCategoryDto>>(menus, "查詢成功"));
        }

        [AllowAnonymous]
        [HttpGet("active-with-categories")]
        public IActionResult GetAllMenusWithCategories()
        {
            _logger.LogInformation("Fetching all menus with active categories");
            
            var menus = _context.Menus
                .Include(m => m.Category)
                .Where(m => m.Category != null && m.Category.DeletedAt == null)
                .Select(m => m.ToMenuAndCategoryDto())
                .ToList();

            return Ok(new ApiResponse<List<MenuAndCategoryDto>>(menus, "查詢成功"));
        }


        //新增菜單內容&圖片
        [HttpPost]
        public async Task<IActionResult> CreateMenu([FromForm] MenuDto dto, IFormFile? file)
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

    // 先儲存到資料庫以取得 ID
    _context.Menus.Add(model);
    _context.SaveChanges();

    // 若有上傳檔案，存檔並把路徑寫入 model.Image
    if (file != null && file.Length > 0)
        {
            
    //資料夾路徑設定
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "menus");
        if (!Directory.Exists(uploadsFolder))
        Directory.CreateDirectory(uploadsFolder);

        //檔案名稱設定（現在 model.Id 已經有值了）
        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{model.Id}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        model.Image = $"/uploads/menus/{fileName}";
        model.UpdatedAt = DateTime.Now;
        _context.SaveChanges(); // 再次儲存以更新 Image
    }
    else
    {
        // 若前端在 dto.Image 傳了 URL，也可以保留
        model.Image = dto.Image ?? "/uploads/menus/default.jpg";
        _context.SaveChanges();
    }

    return CreatedAtAction(nameof(GetMenus),
        new { id = model.Id },
        new ApiResponse<MenuDto>(model.ToDto(), "菜單新增成功"));
        }

        //修改菜單內容&圖片
        [HttpPatch]
        public async Task<IActionResult> PatchMenu([FromForm] MenuDto dto , IFormFile? file)
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

           
            // 若有上傳檔案，存檔並把路徑寫入 model.Image
            if (file != null && file.Length > 0)
            {
                //資料夾路徑設定
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "menus");
        if (!Directory.Exists(uploadsFolder))
        Directory.CreateDirectory(uploadsFolder);

        //檔案名稱設定
        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{menu.Id}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);
        using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }
        menu.Image = $"/uploads/menus/{fileName}";
            }
            else if (!string.IsNullOrEmpty(dto.Image))
            {
                // 若前端在 dto.Image 傳了 URL，更新它
                menu.Image = dto.Image;
            }
            // 否則保留原有的 menu.Image，不修改


            menu.ApplyTo(dto, categoryId);
            _context.SaveChanges();

            return Ok(new ApiResponse<MenuDto>(menu.ToDto(), "菜單更新成功"));
        }
        
        //關閉菜單 (可傳LIST)
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
                menu.IsAvailable = input.IsAvailable;
                menu.UpdatedAt = DateTime.Now;
            }

            _context.SaveChanges();

            return Ok(new ApiResponse<List<MenuDto>>(
                menus.Select(m => m.ToDto()).ToList(), 
                "菜單更新成功"));
        }

    //既有菜單新增圖片
    [HttpPost("image/{id}")]
    public async Task<IActionResult> UploadMenuImage(int id, IFormFile file)
        {
            var menu = _context.Menus.FirstOrDefault(x => x.Id == id);
            if (menu == null)
                return NotFound(new ErrorResponse { Message = "菜單不存在" });
        
        //資料夾路徑設定
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "menus");
        if (!Directory.Exists(uploadsFolder))
        Directory.CreateDirectory(uploadsFolder);

        //檔案名稱設定
        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{id}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);
        using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        //前端讀取的URL路徑
        menu.Image = $"/uploads/menus/{fileName}";
        menu.UpdatedAt = DateTime.Now;
        _context.SaveChanges();
        return Ok(new ApiResponse<MenuDto>(menu.ToDto(), "圖片上傳成功"));
        }

    }
}