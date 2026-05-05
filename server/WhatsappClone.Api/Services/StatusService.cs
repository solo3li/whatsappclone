using Microsoft.EntityFrameworkCore;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Entities;

namespace WhatsappClone.Api.Services;

public interface IStatusService
{
    Task CreateStatusAsync(Guid userId, string imageUrl, string caption);
    Task<List<Status>> GetRecentStatusesAsync(Guid userId);
    Task AddReactionAsync(Guid statusId, Guid userId, string emoji);
}

public class StatusService : IStatusService
{
    private readonly WhatsappDbContext _context;

    public StatusService(WhatsappDbContext context)
    {
        _context = context;
    }

    public async Task CreateStatusAsync(Guid userId, string imageUrl, string caption)
    {
        var status = new Status
        {
            UserId = userId,
            ImageUrl = imageUrl,
            Caption = caption,
            CreatedAt = DateTime.UtcNow
        };

        _context.Statuses.Add(status);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Status>> GetRecentStatusesAsync(Guid userId)
    {
        // For prototype, show statuses from all users except blocked ones
        var blockedUserIds = await _context.Blocks
            .Where(b => b.BlockerId == userId)
            .Select(b => b.BlockedId)
            .ToListAsync();

        return await _context.Statuses
            .Include(s => s.User)
            .Include(s => s.Reactions)
            .Where(s => !blockedUserIds.Contains(s.UserId) && s.CreatedAt > DateTime.UtcNow.AddHours(-24))
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task AddReactionAsync(Guid statusId, Guid userId, string emoji)
    {
        var reaction = new StatusReaction
        {
            StatusId = statusId,
            UserId = userId,
            Emoji = emoji,
            Timestamp = DateTime.UtcNow
        };

        _context.StatusReactions.Add(reaction);
        await _context.SaveChangesAsync();
    }
}
