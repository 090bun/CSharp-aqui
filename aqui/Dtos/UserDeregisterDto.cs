using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace aqui.Dtos
{
    public class UserDeregisterDto
    {
        public bool IsAvailable { get; set; } = false;
        public DateTime UpdatedAt {get; set; }
    }
}