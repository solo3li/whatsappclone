using Microsoft.EntityFrameworkCore;
using WhatsappClone.Api.Entities;

namespace WhatsappClone.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(WhatsappDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        var users = new List<User>
        {
            new User { Id = Guid.NewGuid(), Name = "Alice Smith", Email = "alice@example.com", AvatarUrl = "https://i.pravatar.cc/150?img=1", Status = "Hey there! I am using WhatsApp." },
            new User { Id = Guid.NewGuid(), Name = "Bob Johnson", Email = "bob@example.com", AvatarUrl = "https://i.pravatar.cc/150?img=2", Status = "Busy at work" },
            new User { Id = Guid.NewGuid(), Name = "Charlie Brown", Email = "charlie@example.com", AvatarUrl = "https://i.pravatar.cc/150?img=3", Status = "At the gym" },
            new User { Id = Guid.NewGuid(), Name = "David Wilson", Email = "david@example.com", AvatarUrl = "https://i.pravatar.cc/150?img=4", Status = "Can't talk, WhatsApp only" },
            new User { Id = Guid.NewGuid(), Name = "Emma Davis", Email = "emma@example.com", AvatarUrl = "https://i.pravatar.cc/150?img=5", Status = "Available" }
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Create some chats
        var alice = users[0];
        var bob = users[1];
        var charlie = users[2];

        var chat1 = new Chat { IsGroup = false };
        chat1.Participants.Add(new ChatParticipant { UserId = alice.Id });
        chat1.Participants.Add(new ChatParticipant { UserId = bob.Id });

        var chat2 = new Chat { IsGroup = false };
        chat2.Participants.Add(new ChatParticipant { UserId = alice.Id });
        chat2.Participants.Add(new ChatParticipant { UserId = charlie.Id });

        context.Chats.AddRange(chat1, chat2);
        await context.SaveChangesAsync();

        // Add some messages
        var messages = new List<Message>
        {
            new Message { ChatId = chat1.Id, SenderId = bob.Id, Content = "Hey Alice! How's it going?", Timestamp = DateTime.UtcNow.AddHours(-1) },
            new Message { ChatId = chat1.Id, SenderId = alice.Id, Content = "Hi Bob! All good here, you?", Timestamp = DateTime.UtcNow.AddMinutes(-45) },
            new Message { ChatId = chat1.Id, SenderId = bob.Id, Content = "Great, just finishing up work.", Timestamp = DateTime.UtcNow.AddMinutes(-30) },
            
            new Message { ChatId = chat2.Id, SenderId = charlie.Id, Content = "Alice, did you see the report?", Timestamp = DateTime.UtcNow.AddHours(-2) },
            new Message { ChatId = chat2.Id, SenderId = alice.Id, Content = "Not yet, I'll check it in a bit.", Timestamp = DateTime.UtcNow.AddHours(-1) }
        };

        context.Messages.AddRange(messages);
        await context.SaveChangesAsync();

        // Add some statuses
        var statuses = new List<Status>
        {
            new Status { UserId = bob.Id, ImageUrl = "https://images.unsplash.com/photo-1511764904403-9df276dbb900", CreatedAt = DateTime.UtcNow.AddHours(-5) },
            new Status { UserId = charlie.Id, ImageUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", CreatedAt = DateTime.UtcNow.AddHours(-2) }
        };

        context.Statuses.AddRange(statuses);
        await context.SaveChangesAsync();
    }
}
