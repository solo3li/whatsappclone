using Microsoft.EntityFrameworkCore;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Entities;

namespace WhatsappClone.Api.Services;

public interface IUserService
{
    Task<User?> GetProfileAsync(Guid userId);
    Task UpdateProfileAsync(Guid userId, string name, string avatarUrl, string status);
    Task<List<User>> SearchUsersAsync(string query);
    Task BlockUserAsync(Guid blockerId, Guid blockedId);
    Task UnblockUserAsync(Guid blockerId, Guid blockedId);
    Task<bool> IsBlockedAsync(Guid userId, Guid otherUserId);
}

public class UserService : IUserService
{
    private readonly WhatsappDbContext _context;

    public UserService(WhatsappDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetProfileAsync(Guid userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task UpdateProfileAsync(Guid userId, string name, string avatarUrl, string status)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return;

        user.Name = name;
        user.AvatarUrl = avatarUrl;
        user.Status = status;

        await _context.SaveChangesAsync();
    }

    public async Task<List<User>> SearchUsersAsync(string query)
    {
        return await _context.Users
            .Where(u => u.Name.Contains(query) || u.Email.Contains(query))
            .Take(20)
            .ToListAsync();
    }

    public async Task BlockUserAsync(Guid blockerId, Guid blockedId)
    {
        if (await _context.Blocks.AnyAsync(b => b.BlockerId == blockerId && b.BlockedId == blockedId)) return;

        var block = new Block
        {
            BlockerId = blockerId,
            BlockedId = blockedId
        };

        _context.Blocks.Add(block);
        await _context.SaveChangesAsync();
    }

    public async Task UnblockUserAsync(Guid blockerId, Guid blockedId)
    {
        var block = await _context.Blocks.FindAsync(blockerId, blockedId);
        if (block != null)
        {
            _context.Blocks.Remove(block);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> IsBlockedAsync(Guid userId, Guid otherUserId)
    {
        return await _context.Blocks.AnyAsync(b => 
            (b.BlockerId == userId && b.BlockedId == otherUserId) || 
            (b.BlockerId == otherUserId && b.BlockedId == userId));
    }
}
