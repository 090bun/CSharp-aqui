using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Models;

namespace aqui.Dtos
{
    public class NewsDto
    {
        public int Id { get; set; }
        public string ? Title { get; set; } 
        public string ? Content { get; set; } 
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    public static class NewsDtoExtensions
    {
        public static NewsDto FromModel(News news)
        {
            return new NewsDto
            {
                Id = news.Id,
                Title = news.Title,
                Content = news.Content,
                CreatedAt = news.CreatedAt,
                UpdatedAt = news.UpdatedAt
            };
        }
        public static News ToModel(NewsDto newsDto)
        {
            return new News
            {
                Id = newsDto.Id,
                Title = newsDto.Title ?? string.Empty,
                Content = newsDto.Content ?? string.Empty,
                CreatedAt = newsDto.CreatedAt,
                UpdatedAt = newsDto.UpdatedAt
            };
        }
        public static void UpdateModel(this News news, NewsDto newsDto)
        {
            news.Title = newsDto.Title ?? news.Title;
            news.Content = newsDto.Content ?? news.Content;
        }
    } 
}