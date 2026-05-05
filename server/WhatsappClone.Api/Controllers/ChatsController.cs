using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.DTOs;
using WhatsappClone.Api.Entities;

namespace WhatsappClone.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatsController : ControllerBase
{
    private readonly WhatsappDbContext _context;

    public ChatsController(WhatsappDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetChats()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var chats = await _context.Chats
            .Where(c => c.Participants.Any(p => p.UserId == userId))
            .Select(c => new ChatDto(
                c.Id,
                c.IsGroup ? (c.GroupName ?? "Group") : c.Participants.First(p => p.UserId != userId).User.Name ?? "User",
                c.IsGroup ? (c.GroupIconUrl ?? "") : c.Participants.First(p => p.UserId != userId).User.AvatarUrl ?? "",
                c.Messages.OrderByDescending(m => m.Timestamp).Select(m => m.Content).FirstOrDefault() ?? "",
                c.Messages.OrderByDescending(m => m.Timestamp).Select(m => m.Timestamp).FirstOrDefault(),
                0 // TODO: Implement unread count
            ))
            .ToListAsync();

        return Ok(chats);
    }

    [HttpGet("{chatId}/messages")]
    public async Task<IActionResult> GetMessages(Guid chatId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var messages = await _context.Messages
            .Where(m => m.ChatId == chatId)
            .OrderBy(m => m.Timestamp)
            .Select(m => new MessageDto(
                m.Id,
                m.Content ?? "",
                m.SenderId,
                m.Sender.Name ?? "User",
                m.Timestamp,
                m.SenderId == userId,
                m.MediaUrl, // Mapping MediaUrl to Image for now in DTO
                null, // Audio mapping
                m.MediaUrl, // FileUri mapping
                m.FileName,
                m.FileSize,
                m.ReplyToId,
                m.ReplyTo != null ? m.ReplyTo.Content : null
            ))
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> CreateChat([FromBody] CreateChatRequest request)
    {
        var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Check if a direct chat already exists
        var existingChat = await _context.Chats
            .Where(c => !c.IsGroup)
            .Where(c => c.Participants.Any(p => p.UserId == currentUserId) && c.Participants.Any(p => p.UserId == request.UserId))
            .FirstOrDefaultAsync();

        if (existingChat != null) return Ok(existingChat.Id);

        var chat = new Chat { IsGroup = false };
        chat.Participants.Add(new ChatParticipant { UserId = currentUserId });
        chat.Participants.Add(new ChatParticipant { UserId = request.UserId });

        _context.Chats.Add(chat);
        await _context.SaveChangesAsync();

        return Ok(chat.Id);
    }
}
