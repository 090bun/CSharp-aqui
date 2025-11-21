using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Dtos;
using aqui.Services.Responses;

namespace aqui.Services.Validator
{
    public class MenuValidator
    {
        public static ErrorResponse? ValidateMenu(MenuDto dto)
        {
            if (dto.Name == null)
            {
                return(new ErrorResponse{Message="菜單名稱不可為空"});
            }
            return null;
        }
    }
}