using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WhatsappClone.Api.DTOs;
using WhatsappClone.Api.Services;

namespace WhatsappClone.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StatusesController : ControllerBase
{
    private readonly IStatusService _statusService;

    public StatusesController(IStatusService statusService)
    {
        _statusService = statusService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRecent()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var statuses = await _statusService.GetRecentStatusesAsync(userId);
        return Ok(statuses.Select(s => new {
            s.Id,
            s.ImageUrl,
            s.Caption,
            s.CreatedAt,
            User = new UserDto(s.User.Id, s.User.Email, s.User.Name ?? "", s.User.AvatarUrl ?? "", s.User.Status ?? ""),
            Reactions = s.Reactions.Select(r => new { r.Emoji, r.UserId })
        }));
    }

    [HttpPost]
    public async Task<IActionResult> PostStatus([FromBody] StatusUpdateDto request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _statusService.CreateStatusAsync(userId, request.Image, request.Caption);
        return Ok();
    }

    [HttpPost("{statusId}/react")]
    public async Task<IActionResult> React(Guid statusId, [FromBody] string emoji)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _statusService.AddReactionAsync(statusId, userId, emoji);
        return Ok();
    }
}
