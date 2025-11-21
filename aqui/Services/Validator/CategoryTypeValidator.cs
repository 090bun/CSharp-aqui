using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Models;

namespace aqui.Services.Validator
{
    public class CategoryTypeValidator
    {
        public static (bool Item1, int Item2) IsValidCategoryType<T>(T categoryType)
        {
            if (categoryType == null)
            {
                return (false, -1);
            }
             // 直接是 enum 類型
            if (categoryType is CategoryType ctEnum)
            {
                return (true, (int)ctEnum);
            }

            // 數值型別（含 boxed）
            if (categoryType is int i)
            {
                return Enum.IsDefined(typeof(CategoryType), i) ? (true, i) : (false, -1);
            }
            if (categoryType is short s)
            {
                int vi = s;
                return Enum.IsDefined(typeof(CategoryType), vi) ? (true, vi) : (false, -1);
            }
            if (categoryType is long l)
            {
                if (l >= int.MinValue && l <= int.MaxValue)
                {
                    int vi = (int)l;
                    return Enum.IsDefined(typeof(CategoryType), vi) ? (true, vi) : (false, -1);
                }
                return (false, -1);
            }
            if (categoryType is byte b)
            {
                int vi = b;
                return Enum.IsDefined(typeof(CategoryType), vi) ? (true, vi) : (false, -1);
            }

            // 字串型別（英文、中文、或數字）
            if (categoryType is string str)
            {
                if (string.IsNullOrWhiteSpace(str))
                {
                    return (false, -1);
                }

                var normalized = str.Trim();

                // 若是純數字
                if (int.TryParse(normalized, out var numeric))
                {
                    return Enum.IsDefined(typeof(CategoryType), numeric) ? (true, numeric) : (false, -1);
                }

                // 英文名稱（忽略大小寫）
                if (Enum.TryParse(typeof(CategoryType), normalized, true, out var parsed))
                {
                    return (true, (int)parsed);
                }

                // 中文別名映射
                switch (normalized)
                {
                    case "套餐":
                        return (true, (int)CategoryType.SetMeal);
                    case "主餐":
                        return (true, (int)CategoryType.Main);
                    case "湯品":
                        return (true, (int)CategoryType.Soup);
                    case "小菜":
                        return (true, (int)CategoryType.SideDish);
                    default:
                        return (false, -1);
                }
            }

            // 其他型別嘗試轉字串再判斷（可選，避免過度寬鬆，這裡不做）
            return (false, -1);
        }
    }
}