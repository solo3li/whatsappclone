using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Entities;

namespace WhatsappClone.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StatusesController : ControllerBase
{
    private readonly WhatsappDbContext _context;

    public StatusesController(WhatsappDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetStatuses()
    {
        var statuses = await _context.Statuses
            .Include(s => s.User)
            .Where(s => s.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new {
                s.Id,
                s.ImageUrl,
                s.CreatedAt,
                User = new {
                    s.User.Id,
                    s.User.Name,
                    s.User.AvatarUrl
                }
            })
            .ToListAsync();

        return Ok(statuses);
    }

    [HttpPost]
    public async Task<IActionResult> CreateStatus([FromBody] CreateStatusRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var status = new Status
        {
            UserId = userId,
            ImageUrl = request.ImageUrl,
            Caption = request.Caption
        };

        _context.Statuses.Add(status);
        await _context.SaveChangesAsync();

        return Ok(status.Id);
    }
}

public record CreateStatusRequest(string ImageUrl, string? Caption);
