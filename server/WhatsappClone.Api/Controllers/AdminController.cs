using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WhatsappClone.Api.Data;

namespace WhatsappClone.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly WhatsappDbContext _context;

    public AdminController(WhatsappDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userCount = await _context.Users.CountAsync();
        var chatCount = await _context.Chats.CountAsync();
        var messageCount = await _context.Messages.CountAsync();

        return Ok(new
        {
            userCount,
            chatCount,
            messageCount
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }
}
