using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace aqui.Services.Responses
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }

        public ApiResponse(T Date, string message = "")
        {
            Success = true;
            Data= Date;
            Message = message;
        }
    }
}