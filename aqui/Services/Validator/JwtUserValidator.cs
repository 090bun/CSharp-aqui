using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using aqui.Data;
using aqui.Dtos;
using aqui.Models;

namespace aqui.Services.Validator
{
    public class JwtUserValidator
    {
        private readonly IConfiguration _config;
        private readonly AquiContext _context;

        public JwtUserValidator(IConfiguration config, AquiContext context)
        {
            _config = config;
            _context = context;
        }

       public bool TryGetUserId(ClaimsPrincipal user, out int userId)
{
    var idValue = user.FindFirst("Id")?.Value;
    return int.TryParse(idValue, out userId);
}
        
    }
}