namespace WhatsappClone.Api.Entities;

public class Status
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public string? Caption { get; set; }
    public string? BackgroundColor { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);

    public ICollection<StatusReaction> Reactions { get; set; } = new List<StatusReaction>();
}
