using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using aqui.Data;
using aqui.Dtos;
using aqui.Services;
using aqui.Services.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace aqui.Controller
{
    [Route("api/v1/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly ILogger<LoginController> _logger;
        private readonly JwtService _jwtService;
        private readonly AquiContext  _context;

        public LoginController(ILogger<LoginController> logger , JwtService jwtService,AquiContext context)
        {
            _logger = logger;
            _jwtService = jwtService;
            _context = context;
        }

        [HttpPost]
public IActionResult Login([FromBody] LoginDto loginDto)
{
    var user = _context.Users.FirstOrDefault(x => x.Email == loginDto.Email);
    if (user == null)
        return Unauthorized(new ErrorResponse("帳號或密碼錯誤"));

    if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
        return Unauthorized(new ErrorResponse("帳號或密碼錯誤"));

    var token = _jwtService.GenerateToken(user.Id, user.Role.ToString(), user.Name, user.Email);

    return Ok(new
    {
        Message = "登入成功",
        Token = token
    });
}

}
}