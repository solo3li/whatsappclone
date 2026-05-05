using Microsoft.EntityFrameworkCore;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Entities;
using WhatsappClone.Api.Services;
using Xunit;

namespace WhatsappClone.Tests;

public class UserServiceTests
{
    private WhatsappDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<WhatsappDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new WhatsappDbContext(options);
    }

    [Fact]
    public async Task UpdateProfile_ShouldUpdateUserFields()
    {
        // Arrange
        var context = GetDbContext();
        var user = new User { Email = "test@example.com", Name = "Old Name" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var service = new UserService(context);

        // Act
        await service.UpdateProfileAsync(user.Id, "New Name", "new_avatar.png", "Feeling good");

        // Assert
        var updatedUser = await context.Users.FindAsync(user.Id);
        Assert.Equal("New Name", updatedUser.Name);
        Assert.Equal("new_avatar.png", updatedUser.AvatarUrl);
        Assert.Equal("Feeling good", updatedUser.Status);
    }

    [Fact]
    public async Task BlockUser_ShouldAddBlockEntry()
    {
        // Arrange
        var context = GetDbContext();
        var user1 = new User { Email = "u1@e.com" };
        var user2 = new User { Email = "u2@e.com" };
        context.Users.AddRange(user1, user2);
        await context.SaveChangesAsync();

        var service = new UserService(context);

        // Act
        await service.BlockUserAsync(user1.Id, user2.Id);

        // Assert
        var block = await context.Blocks.FindAsync(user1.Id, user2.Id);
        Assert.NotNull(block);
    }

    [Fact]
    public async Task IsBlocked_ShouldReturnTrueIfBlocked()
    {
        // Arrange
        var context = GetDbContext();
        var user1 = new User { Email = "u1@e.com" };
        var user2 = new User { Email = "u2@e.com" };
        context.Users.AddRange(user1, user2);
        context.Blocks.Add(new Block { BlockerId = user1.Id, BlockedId = user2.Id });
        await context.SaveChangesAsync();

        var service = new UserService(context);

        // Act & Assert
        Assert.True(await service.IsBlockedAsync(user1.Id, user2.Id));
        Assert.True(await service.IsBlockedAsync(user2.Id, user1.Id)); // Bi-directional check
        Assert.False(await service.IsBlockedAsync(user1.Id, Guid.NewGuid()));
    }
}
