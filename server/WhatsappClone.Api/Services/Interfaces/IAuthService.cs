using WhatsappClone.Api.Entities;

namespace WhatsappClone.Api.Services.Interfaces;

public interface IAuthService
{
    Task<string> RequestOtpAsync(string email);
    Task<(string Token, User User)?> VerifyOtpAsync(string email, string otp);
}
