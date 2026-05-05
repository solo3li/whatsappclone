using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Entities;

namespace WhatsappClone.Api.Controllers;

public class AdminPanelController : Controller
{
    private readonly WhatsappDbContext _context;

    public AdminPanelController(WhatsappDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Dashboard()
    {
        ViewBag.UserCount = await _context.Users.CountAsync();
        ViewBag.MessageCount = await _context.Messages.CountAsync();
        ViewBag.ChatCount = await _context.Chats.CountAsync();
        ViewBag.StatusCount = await _context.Statuses.CountAsync();

        return View();
    }

    public async Task<IActionResult> Users()
    {
        var users = await _context.Users.ToListAsync();
        return View(users);
    }

    public async Task<IActionResult> UserProfile(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.Statuses)
            .FirstOrDefaultAsync(u => u.Id == id);
            
        if (user == null) return NotFound();
        
        return View(user);
    }

    [HttpPost]
    public async Task<IActionResult> ToggleOnline(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            user.IsOnline = !user.IsOnline;
            user.LastSeen = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        return RedirectToAction(nameof(Users));
    }

    public async Task<IActionResult> Messages(string searchTerm)
    {
        var query = _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Chat)
            .AsQueryable();

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(m => m.Content.Contains(searchTerm) || m.Sender.Name.Contains(searchTerm));
        }

        var messages = await query.OrderByDescending(m => m.Timestamp).Take(100).ToListAsync();
        ViewBag.SearchTerm = searchTerm;
        return View(messages);
    }

    public async Task<IActionResult> Statuses()
    {
        var statuses = await _context.Statuses
            .Include(s => s.User)
            .Where(s => s.CreatedAt > DateTime.UtcNow.AddHours(-24))
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
            
        return View(statuses);
    }

    [HttpPost]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
        return RedirectToAction(nameof(Users));
    }
}
