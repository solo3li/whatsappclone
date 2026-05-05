using Microsoft.EntityFrameworkCore;
using WhatsappClone.Api.Entities;

namespace WhatsappClone.Api.Data;

public class WhatsappDbContext : DbContext
{
    public WhatsappDbContext(DbContextOptions<WhatsappDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Chat> Chats => Set<Chat>();
    public DbSet<ChatParticipant> ChatParticipants => Set<ChatParticipant>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<StatusReaction> StatusReactions => Set<StatusReaction>();
    public DbSet<Block> Blocks => Set<Block>();
    public DbSet<UserOTP> UserOTPs => Set<UserOTP>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ChatParticipant>()
            .HasKey(cp => new { cp.ChatId, cp.UserId });

        modelBuilder.Entity<Block>()
            .HasKey(b => new { b.BlockerId, b.BlockedId });

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ChatParticipant>()
            .HasOne(cp => cp.User)
            .WithMany(u => u.ChatParticipants)
            .HasForeignKey(cp => cp.UserId);

        modelBuilder.Entity<ChatParticipant>()
            .HasOne(cp => cp.Chat)
            .WithMany(c => c.Participants)
            .HasForeignKey(cp => cp.ChatId);
            
        modelBuilder.Entity<Status>()
            .HasOne(s => s.User)
            .WithMany(u => u.Statuses)
            .HasForeignKey(s => s.UserId);
    }
}
