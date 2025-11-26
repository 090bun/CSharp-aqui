using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aqui.Services.Responses;

namespace aqui.Dtos
{
    public class PasswordUpdateDto
    {
        public string OldPassword { get; set;} = string.Empty;
        public string NewPassword { get; set;} = string.Empty;
    }

    public static class PasswordUpdateDtoExtensions
    {
        public static PasswordUpdateDto resetPassword(params string[] password)
        {
            return new PasswordUpdateDto
            {
                OldPassword = password[0],
                NewPassword = password[1]
            };
        }
    }
}