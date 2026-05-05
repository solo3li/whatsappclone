using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WhatsappClone.Api.DTOs;
using WhatsappClone.Api.Services;

namespace WhatsappClone.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _userService.GetProfileAsync(userId);
        if (user == null) return NotFound();

        return Ok(new UserDto(user.Id, user.Email, user.Name ?? "", user.AvatarUrl ?? "", user.Status ?? ""));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserDto request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _userService.UpdateProfileAsync(userId, request.Name, request.Avatar, request.Status);
        return Ok();
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        var users = await _userService.SearchUsersAsync(query);
        return Ok(users.Select(u => new UserDto(u.Id, u.Email, u.Name ?? "", u.AvatarUrl ?? "", u.Status ?? "")));
    }

    [HttpPost("block/{blockedId}")]
    public async Task<IActionResult> Block(Guid blockedId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _userService.BlockUserAsync(userId, blockedId);
        return Ok();
    }

    [HttpDelete("block/{blockedId}")]
    public async Task<IActionResult> Unblock(Guid blockedId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _userService.UnblockUserAsync(userId, blockedId);
        return Ok();
    }
}
