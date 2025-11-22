using System;
using System.Linq;
using aqui.Data;
using aqui.Models;

namespace aqui.Services.Validator
{
    public class CategoryTypeValidator
    {
        // 以資料庫為準：
        // - 若輸入為數字/可轉數字：視為 CategoryId，需存在於 DB
        // - 若輸入為字串：視為 Category.Name，需存在於 DB（精確比對，去除空白）
        public static (bool IsValid, int CategoryId) IsValidCategory(AquiContext context, object? category)
        {
            if (category == null)
            {
                return (false, -1);
            }

            // 直接是整數 Id
            if (category is int id)
            {
                var exists = context.Categories.Any(c => c.Id == id);
                return exists ? (true, id) : (false, -1);
            }

            // 其他數值型別
            if (category is long l)
            {
                if (l < int.MinValue || l > int.MaxValue) return (false, -1);
                int id2 = (int)l;
                var exists = context.Categories.Any(c => c.Id == id2);
                return exists ? (true, id2) : (false, -1);
            }
            if (category is short s)
            {
                int id2 = s;
                var exists = context.Categories.Any(c => c.Id == id2);
                return exists ? (true, id2) : (false, -1);
            }
            if (category is byte b)
            {
                int id2 = b;
                var exists = context.Categories.Any(c => c.Id == id2);
                return exists ? (true, id2) : (false, -1);
            }

            // 字串：數字 => Id；否則以名稱比對
            var str = category.ToString();
            if (string.IsNullOrWhiteSpace(str)) return (false, -1);
            var normalized = str.Trim();

            if (int.TryParse(normalized, out var numericId))
            {
                var exists = context.Categories.Any(c => c.Id == numericId);
                return exists ? (true, numericId) : (false, -1);
            }

            var found = context.Categories
                               .Where(c => c.Name == normalized)
                               .Select(c => c.Id)
                               .FirstOrDefault();
            if (found > 0)
            {
                return (true, found);
            }

            return (false, -1);
        }
    }
}