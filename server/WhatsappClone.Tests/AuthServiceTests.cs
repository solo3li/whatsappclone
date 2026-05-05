using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Services;
using WhatsappClone.Api.Services.Interfaces;
using Xunit;

namespace WhatsappClone.Tests;

public class AuthServiceTests
{
    private WhatsappDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<WhatsappDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new WhatsappDbContext(options);
    }

    [Fact]
    public async Task RequestOtp_ShouldCreateUserOtpAndSendEmail()
    {
        // Arrange
        var context = GetDbContext();
        var emailServiceMock = new Mock<IEmailService>();
        var configMock = new Mock<IConfiguration>();
        
        var service = new AuthService(context, configMock.Object, emailServiceMock.Object);
        var email = "test@example.com";

        // Act
        var otp = await service.RequestOtpAsync(email);

        // Assert
        Assert.Equal(6, otp.Length);
        Assert.Contains(context.UserOTPs, x => x.Email == email && x.OTP == otp);
        emailServiceMock.Verify(x => x.SendOtpEmailAsync(email, otp), Times.Once);
    }

    [Fact]
    public async Task VerifyOtp_ShouldReturnTokenAndUser_WhenValid()
    {
        // Arrange
        var context = GetDbContext();
        var email = "test@example.com";
        var otpCode = "123456";
        context.UserOTPs.Add(new WhatsappClone.Api.Entities.UserOTP 
        { 
            Email = email, 
            OTP = otpCode, 
            ExpiresAt = DateTime.UtcNow.AddMinutes(10) 
        });
        await context.SaveChangesAsync();

        var emailServiceMock = new Mock<IEmailService>();
        var configMock = new Mock<IConfiguration>();
        
        // Mocking IConfiguration for JWT settings
        var jwtSection = new Mock<IConfigurationSection>();
        jwtSection.Setup(s => s["Key"]).Returns("a_very_long_and_secure_secret_key_for_whatsapp_clone_2026");
        jwtSection.Setup(s => s["Issuer"]).Returns("Issuer");
        jwtSection.Setup(s => s["Audience"]).Returns("Audience");
        configMock.Setup(c => c.GetSection("JwtSettings")).Returns(jwtSection.Object);

        var service = new AuthService(context, configMock.Object, emailServiceMock.Object);

        // Act
        var result = await service.VerifyOtpAsync(email, otpCode);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.Value.Token);
        Assert.Equal(email, result.Value.User.Email);
        
        var usedOtp = await context.UserOTPs.FirstAsync(x => x.Email == email && x.OTP == otpCode);
        Assert.True(usedOtp.IsUsed);
    }
}
