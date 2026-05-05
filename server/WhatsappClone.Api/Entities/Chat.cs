namespace WhatsappClone.Api.Entities;

public class Chat
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public bool IsGroup { get; set; }
    public string? GroupName { get; set; }
    public string? GroupDescription { get; set; }
    public string? GroupIconUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ChatParticipant> Participants { get; set; } = new List<ChatParticipant>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
