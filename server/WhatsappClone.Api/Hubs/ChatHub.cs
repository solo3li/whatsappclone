using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Entities;
using System.Security.Claims;

namespace WhatsappClone.Api.Hubs;

public class ChatHub : Hub
{
    private readonly WhatsappDbContext _context;
    private static readonly Dictionary<string, string> OnlineUsers = new(); // UserId -> ConnectionId

    public ChatHub(WhatsappDbContext context)
    {
        _context = context;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            OnlineUsers[userId] = Context.ConnectionId;
            
            var user = await _context.Users.FindAsync(Guid.Parse(userId));
            if (user != null)
            {
                user.IsOnline = true;
                user.LastSeen = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                
                await Clients.Others.SendAsync("UserStatusChanged", userId, true);
            }
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            OnlineUsers.Remove(userId);
            
            var user = await _context.Users.FindAsync(Guid.Parse(userId));
            if (user != null)
            {
                user.IsOnline = false;
                user.LastSeen = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                
                await Clients.Others.SendAsync("UserStatusChanged", userId, false, user.LastSeen);
            }
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(Guid chatId, string content, MessageType type = MessageType.Text)
    {
        var senderId = Guid.Parse(Context.UserIdentifier!);
        
        var message = new Message
        {
            ChatId = chatId,
            SenderId = senderId,
            Content = content,
            MessageType = type,
            Timestamp = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var participants = await _context.ChatParticipants
            .Where(cp => cp.ChatId == chatId)
            .Select(cp => cp.UserId.ToString())
            .ToListAsync();

        await Clients.Users(participants).SendAsync("ReceiveMessage", new
        {
            message.Id,
            message.ChatId,
            message.SenderId,
            message.Content,
            message.MessageType,
            message.Timestamp,
            SenderName = Context.User?.Identity?.Name
        });
    }

    public async Task SendTyping(Guid chatId, bool isTyping)
    {
        var userId = Context.UserIdentifier;
        var participants = await _context.ChatParticipants
            .Where(cp => cp.ChatId == chatId && cp.UserId != Guid.Parse(userId!))
            .Select(cp => cp.UserId.ToString())
            .ToListAsync();

        await Clients.Users(participants).SendAsync("UserTyping", chatId, userId, isTyping);
    }

    public async Task MarkAsRead(Guid messageId)
    {
        var message = await _context.Messages.FindAsync(messageId);
        if (message != null && !message.IsRead)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await Clients.User(message.SenderId.ToString()).SendAsync("MessageRead", messageId, message.ReadAt);
        }
    }

    public async Task AddReaction(Guid messageId, string emoji)
    {
        var userId = Context.UserIdentifier;
        var message = await _context.Messages.FindAsync(messageId);
        if (message != null)
        {
            // Simplified reaction logic for prototype
            // In a real app, we'd have a separate table or a more robust JSON structure
            message.Reactions = emoji; 
            await _context.SaveChangesAsync();

            var participants = await _context.ChatParticipants
                .Where(cp => cp.ChatId == message.ChatId)
                .Select(cp => cp.UserId.ToString())
                .ToListAsync();

            await Clients.Users(participants).SendAsync("MessageReaction", messageId, userId, emoji);
        }
    }
}
