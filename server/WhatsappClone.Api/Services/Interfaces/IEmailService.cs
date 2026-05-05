namespace WhatsappClone.Api.Services.Interfaces;

public interface IEmailService
{
    Task SendOtpEmailAsync(string email, string otp);
}
