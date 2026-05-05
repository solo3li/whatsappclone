using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.DTOs;

namespace WhatsappClone.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CallsController : ControllerBase
{
    private readonly WhatsappDbContext _context;

    public CallsController(WhatsappDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCalls()
    {
        // For prototype, we'll return a simulated list or implement a Call entity if needed.
        // Since the current entities don't have a Call table, let's return some seeded data.
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var calls = new List<object>
        {
            new { id = "1", user = new { name = "John Doe", avatarUrl = "https://i.pravatar.cc/150?u=john" }, time = DateTime.UtcNow.AddHours(-1), type = "incoming", isVideo = true },
            new { id = "2", user = new { name = "Jane Smith", avatarUrl = "https://i.pravatar.cc/150?u=jane" }, time = DateTime.UtcNow.AddHours(-5), type = "missed", isVideo = false },
            new { id = "3", user = new { name = "Alice Smith", avatarUrl = "https://i.pravatar.cc/150?u=alice" }, time = DateTime.UtcNow.AddDays(-1), type = "outgoing", isVideo = false }
        };

        return Ok(calls);
    }
}
