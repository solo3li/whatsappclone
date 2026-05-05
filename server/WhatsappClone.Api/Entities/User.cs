using System.ComponentModel.DataAnnotations;

namespace WhatsappClone.Api.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Status { get; set; } = "Available";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsOnline { get; set; }
    public DateTime? LastSeen { get; set; }

    public ICollection<ChatParticipant> ChatParticipants { get; set; } = new List<ChatParticipant>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Status> Statuses { get; set; } = new List<Status>();
}
