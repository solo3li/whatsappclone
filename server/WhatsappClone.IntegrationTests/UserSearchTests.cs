using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using WhatsappClone.Api.DTOs;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Entities;

namespace WhatsappClone.IntegrationTests;

public class UserSearchTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public UserSearchTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Search_Users_By_Name_And_Email_Returns_Correct_Results()
    {
        // 1. Arrange: Seed specific test data
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<WhatsappDbContext>();
            
            // Ensure we have a clean slate or known users
            if (!db.Users.Any(u => u.Email == "search_test@example.com"))
            {
                db.Users.Add(new User { 
                    Id = Guid.NewGuid(), 
                    Name = "Search Test User", 
                    Email = "search_test@example.com", 
                    Status = "Testing search" 
                });
                await db.SaveChangesAsync();
            }
        }

        var client = _factory.CreateClient();

        // 2. Act: Search by Name
        var nameResponse = await client.GetAsync("/api/Users/search?query=Search Test");
        var nameContent = await nameResponse.Content.ReadAsStringAsync();
        Assert.True(nameResponse.IsSuccessStatusCode, $"Response failed with status {nameResponse.StatusCode} and content: {nameContent}");
        var nameResults = await nameResponse.Content.ReadFromJsonAsync<List<UserDto>>();

        // 3. Act: Search by Email
        var emailResponse = await client.GetAsync("/api/Users/search?query=search_test@example.com");
        var emailResults = await emailResponse.Content.ReadFromJsonAsync<List<UserDto>>();

        // 4. Assert
        Assert.True(nameResponse.IsSuccessStatusCode);
        Assert.NotNull(nameResults);
        Assert.Contains(nameResults, u => u.Name == "Search Test User");

        Assert.True(emailResponse.IsSuccessStatusCode);
        Assert.NotNull(emailResults);
        Assert.Contains(emailResults, u => u.Email == "search_test@example.com");
    }

    [Fact]
    public async Task Search_With_No_Results_Returns_Empty_List()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/Users/search?query=NonExistentUser12345");
        var results = await response.Content.ReadFromJsonAsync<List<UserDto>>();

        Assert.True(response.IsSuccessStatusCode);
        Assert.NotNull(results);
        Assert.Empty(results);
    }
}
