using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace aqui.Services.Responses
{
    public class ErrorResponse
    {
        public bool Success { get; set; } = false;
        public string Message { get; set; } = string.Empty;


        public ErrorResponse(string message = "")
        {
            Success = false;
            Message = message;
        }

    }
}