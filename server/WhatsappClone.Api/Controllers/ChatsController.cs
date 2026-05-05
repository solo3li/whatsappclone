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
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = Guid.Parse(userIdString);

        var chats = await _context.Chats
            .Where(c => c.Participants.Any(p => p.UserId == userId))
            .Select(c => new ChatDto(
                c.Id,
                c.IsGroup 
                    ? (c.GroupName ?? "Group") 
                    : (c.Participants.Where(p => p.UserId != userId).Select(p => p.User.Name).FirstOrDefault() ?? "Unknown User"),
                c.IsGroup 
                    ? (c.GroupIconUrl ?? "") 
                    : (c.Participants.Where(p => p.UserId != userId).Select(p => p.User.AvatarUrl).FirstOrDefault() ?? ""),
                c.Messages.OrderByDescending(m => m.Timestamp).Select(m => m.Content).FirstOrDefault() ?? "No messages",
                c.Messages.OrderByDescending(m => m.Timestamp).Select(m => m.Timestamp).FirstOrDefault(),
                c.Messages.Count(m => !m.IsRead && m.SenderId != userId)
            ))
            .ToListAsync();

        return Ok(chats);
    }

    [HttpGet("{chatId}/messages")]
    public async Task<IActionResult> GetMessages(Guid chatId, [FromQuery] int page = 0, [FromQuery] int pageSize = 50)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var messagesQuery = _context.Messages
            .Where(m => m.ChatId == chatId)
            .OrderByDescending(m => m.Timestamp)
            .Skip(page * pageSize)
            .Take(pageSize);

        var messages = await messagesQuery
            .OrderBy(m => m.Timestamp)
            .Select(m => new MessageDto(
                m.Id,
                m.Content ?? "",
                m.SenderId,
                m.Sender.Name ?? "User",
                m.Timestamp,
                m.SenderId == userId,
                m.MessageType == MessageType.Image ? m.MediaUrl : null,
                m.MessageType == MessageType.Audio ? m.MediaUrl : null,
                m.MessageType == MessageType.File ? m.MediaUrl : null,
                m.FileName,
                m.FileSize,
                m.ReplyToId,
                m.ReplyTo != null ? m.ReplyTo.Content : null,
                m.Duration,
                m.Metering
            ))
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> CreateChat([FromBody] CreateChatRequest request)
    {
        try 
        {
            var currentUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserIdString)) 
            {
                Console.WriteLine("CreateChat: currentUserIdString is null or empty");
                return Unauthorized();
            }
            
            var currentUserId = Guid.Parse(currentUserIdString);
            Console.WriteLine($"CreateChat: currentUserId={currentUserId}, targetUserId={request.UserId}");

            // Verify both users exist
            var currentUserExists = await _context.Users.AnyAsync(u => u.Id == currentUserId);
            var targetUserExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);

            if (!currentUserExists) 
            {
                Console.WriteLine($"CreateChat: Current user {currentUserId} NOT FOUND in DB. Auto-provisioning...");
                var email = User.FindFirstValue(ClaimTypes.Email);
                var name = User.FindFirstValue(ClaimTypes.Name) ?? email?.Split('@')[0] ?? "User";
                
                if (string.IsNullOrEmpty(email)) return Unauthorized("Invalid token claims.");

                var newUser = new User 
                {
                    Id = currentUserId,
                    Email = email,
                    Name = name,
                    Status = "Available"
                };
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                Console.WriteLine($"CreateChat: Auto-provisioned user {currentUserId}");
            }

            if (!targetUserExists) 
            {
                Console.WriteLine($"CreateChat: Target user {request.UserId} NOT FOUND in DB");
                return BadRequest("Target user does not exist in database.");
            }

            // Check if a direct chat already exists
            var existingChat = await _context.Chats
                .Where(c => !c.IsGroup)
                .Where(c => c.Participants.Any(p => p.UserId == currentUserId) && c.Participants.Any(p => p.UserId == request.UserId))
                .FirstOrDefaultAsync();

            if (existingChat != null) 
            {
                Console.WriteLine($"CreateChat: Found existing chat {existingChat.Id}");
                return Ok(existingChat.Id);
            }

            var chat = new Chat { 
                IsGroup = false,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
            Console.WriteLine($"CreateChat: Created new chat {chat.Id}");

            var participant1 = new ChatParticipant { ChatId = chat.Id, UserId = currentUserId };
            var participant2 = new ChatParticipant { ChatId = chat.Id, UserId = request.UserId };

            _context.ChatParticipants.AddRange(participant1, participant2);
            await _context.SaveChangesAsync();
            Console.WriteLine($"CreateChat: Added participants to chat {chat.Id}");

            return Ok(chat.Id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"CreateChat: ERROR: {ex.Message}");
            if (ex.InnerException != null) Console.WriteLine($"CreateChat: INNER ERROR: {ex.InnerException.Message}");
            throw;
        }
    }
}
