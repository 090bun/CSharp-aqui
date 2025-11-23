using aqui.Dtos;
using aqui.Services.Responses;
using aqui.Services.Validator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace aqui.Controller
{
    [Authorize(Roles = "Admin,User")]
    [ApiController]
    [Route("api/v1/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly Data.AquiContext _context;
        private readonly JwtUserValidator _jwtUserValidator;
        public UserController(ILogger<UserController> logger, Data.AquiContext context, JwtUserValidator jwtUserValidator)
        {
            _logger = logger;
            _context = context;
            _jwtUserValidator = jwtUserValidator;
        }

        //取得用戶資料
        [HttpGet]
        public IActionResult Get()
        {
            if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }
            var userData = _context.Users.First(u=>u.Id==userId);

            var result = UserExtensions.ToModel(userData);
            
            return Ok(new ApiResponse<UserDto>(result,"查詢成功"));
        }
       //取得指定用戶資料 (Admin專用)
       //包含訂單資料
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetById(int id)
        {
             var userData = _context.Users.FirstOrDefault(u => u.Id == id);
    if (userData == null)
        return NotFound(new ErrorResponse { Message = "找不到用戶" });

    var orders = _context.Orders
        .Where(o => o.UserId == id)
        .Include(o => o.Items)
        .ToList();

    var result = UserIdOrderDtoExtensions.FromModel(userData, orders);
    return Ok(new ApiResponse<UserIdOrderDto>(result, "查詢成功"));
        }


        //修改用戶資料 
        [HttpPatch]
        public IActionResult UserPatchModel([FromBody] UserDto user)
        {
             if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }
            var existingUser = _context.Users.First(u => u.Id == userId);
            existingUser.ApplyTo(user);
            _context.SaveChanges();
            var result = UserExtensions.ToModel(existingUser);  
            return Ok(new ApiResponse<UserDto>(result,"用戶資料更新成功"));
        }

        //註銷用戶
        [HttpPatch("deregister")]
        public IActionResult UserDeregister([FromBody] UserDeregisterDto dto)
        {
            if (!_jwtUserValidator.TryGetUserId(User, out int userId))
            {
                return BadRequest(new ErrorResponse{Message=$"錯誤或不合法ID: {userId}"});
            }
            var existingUser = _context.Users.First(u => u.Id == userId);
            UserExtensions.UserDeregister(existingUser, dto);
            _context.SaveChanges();
            return Ok(new ApiResponse<UserDeregisterDto>(dto,"用戶註銷成功"));
        }

        
       

        //註冊用戶
        [AllowAnonymous]
        [HttpPost]
        public IActionResult UserRegister([FromBody]UserDto user)
        {
            _logger.LogInformation("Registering user with email: {Email}", user.Email);
            var data = UserExtensions.FromModel(user);
            data.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            _context.Users.Add(data);
            _context.SaveChanges();
            var result = UserExtensions.ToModel(data);
            return Ok(new ApiResponse<UserDto>(result,"用戶註冊成功"));
        }

    }
}
