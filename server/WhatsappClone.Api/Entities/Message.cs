namespace WhatsappClone.Api.Entities;

public enum MessageType
{
    Text,
    Image,
    Audio,
    File,
    Video,
    Location
}

public class Message
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChatId { get; set; }
    public Chat Chat { get; set; } = null!;
    
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;
    
    public string? Content { get; set; }
    public MessageType MessageType { get; set; } = MessageType.Text;
    
    public string? MediaUrl { get; set; }
    public string? FileName { get; set; }
    public string? FileSize { get; set; }
    
    public Guid? ReplyToId { get; set; }
    public Message? ReplyTo { get; set; }
    
    public bool IsForwarded { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    
    public string? Reactions { get; set; } // Store as JSON or comma separated for simplicity in this prototype
    
    public double? Duration { get; set; }
    public string? Metering { get; set; } // Store as JSON string
}
