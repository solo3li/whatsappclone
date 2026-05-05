namespace WhatsappClone.Api.Entities;

public class StatusReaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StatusId { get; set; }
    public Status Status { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string Emoji { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
