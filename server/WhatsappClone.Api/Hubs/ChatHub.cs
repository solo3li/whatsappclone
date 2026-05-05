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

    public async Task SendMessage(Guid chatId, string content, MessageType type = MessageType.Text, string? mediaUrl = null, string? fileName = null, string? fileSize = null)
    {
        var senderIdString = Context.UserIdentifier;
        if (string.IsNullOrEmpty(senderIdString)) return;
        
        var senderId = Guid.Parse(senderIdString);
        var senderName = Context.User?.Identity?.Name ?? "User";
        
        var message = new Message
        {
            ChatId = chatId,
            SenderId = senderId,
            Content = type == MessageType.Text ? content : null,
            MessageType = type,
            MediaUrl = type != MessageType.Text ? content : null, // For simplicity, using content param as URL for media types
            FileName = fileName,
            FileSize = fileSize,
            Timestamp = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var participants = await _context.ChatParticipants
            .Where(cp => cp.ChatId == chatId)
            .Select(cp => cp.UserId.ToString())
            .ToListAsync();

        // Broadcast with consistent property names (matching MessageDto)
        await Clients.Users(participants).SendAsync("ReceiveMessage", new
        {
            id = message.Id,
            chatId = message.ChatId,
            text = message.Content ?? "",
            senderId = message.SenderId,
            senderName = senderName,
            time = message.Timestamp,
            isMe = false, // Will be determined by client
            image = message.MessageType == MessageType.Image ? message.MediaUrl : null,
            audio = message.MessageType == MessageType.Audio ? message.MediaUrl : null,
            fileUri = message.MessageType == MessageType.File ? message.MediaUrl : null,
            fileName = message.FileName,
            fileSize = message.FileSize
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

    // --- WebRTC Signaling ---

    public async Task SendCallOffer(string targetUserId, object offer)
    {
        var senderId = Context.UserIdentifier;
        await Clients.User(targetUserId).SendAsync("ReceiveCallOffer", senderId, offer);
    }

    public async Task SendCallAnswer(string targetUserId, object answer)
    {
        var senderId = Context.UserIdentifier;
        await Clients.User(targetUserId).SendAsync("ReceiveCallAnswer", senderId, answer);
    }

    public async Task SendIceCandidate(string targetUserId, object candidate)
    {
        var senderId = Context.UserIdentifier;
        await Clients.User(targetUserId).SendAsync("ReceiveIceCandidate", senderId, candidate);
    }

    public async Task HangUp(string targetUserId)
    {
        var senderId = Context.UserIdentifier;
        await Clients.User(targetUserId).SendAsync("CallHungUp", senderId);
    }
}
