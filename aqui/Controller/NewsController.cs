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
    public class NewsController : ControllerBase
    {
        private readonly ILogger<NewsController> _logger;
        private readonly JwtUserValidator _jwtUserValidator;
        private readonly AquiContext _context;


        public NewsController(ILogger<NewsController> logger, JwtUserValidator jwtUserValidator, AquiContext context)
        {
            _logger = logger;
            _jwtUserValidator = jwtUserValidator;
            _context = context;
        }

        //取得新聞資料
        [HttpGet]
        public IActionResult GetNews()
        {
            var news = _context.News.ToList();
            if (news == null)
            {
                return NotFound(new ErrorResponse { Message = "沒有新聞資料" });
            }
            var result = news.Select(n => NewsDtoExtensions.FromModel(n)).ToList();
            return Ok(new ApiResponse<List<NewsDto>>(result, "查詢成功"));
        }

        //取得單一新聞資料
        [HttpGet("{id}")]
        public IActionResult GetNewsById(int id)
        {
            var news = _context.News.FirstOrDefault(n => n.Id == id);
            if (news == null)
            {
                return NotFound(new ErrorResponse { Message = "新聞不存在" });
            }
            var result = NewsDtoExtensions.FromModel(news);
            return Ok(new ApiResponse<NewsDto>(result, "查詢成功"));
        }
        //新增新聞資料
        [HttpPost]
        public IActionResult PostNews(NewsDto dto)
        {
            var news = NewsDtoExtensions.ToModel(dto);
            _context.News.Add(news);
            _context.SaveChanges();
            return Ok(new ApiResponse<NewsDto>(dto, "新增成功"));
        }

        //修改新聞資料
        [HttpPatch("{id}")]
        public IActionResult UpdateNews([FromRoute]int id,[FromBody] NewsDto dto)
        {
            var news = _context.News.FirstOrDefault(n => n.Id == id);
            if (news == null)
            {
                return NotFound(new ErrorResponse { Message = "新聞不存在" });
            }
            news.UpdateModel(dto);
            news.UpdatedAt = DateTime.Now;
            _context.SaveChanges();
            var result = NewsDtoExtensions.FromModel(news);
            return Ok(new ApiResponse<NewsDto>(result, "修改成功"));
        }

    }
}