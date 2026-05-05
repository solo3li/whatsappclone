using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Entities;
using WhatsappClone.Api.Services.Interfaces;

namespace WhatsappClone.Api.Services;

public class AuthService : IAuthService
{
    private readonly WhatsappDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public AuthService(WhatsappDbContext context, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<string> RequestOtpAsync(string email)
    {
        var otp = new Random().Next(100000, 999999).ToString();
        
        var userOtp = new UserOTP
        {
            Email = email,
            OTP = otp,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        };

        _context.UserOTPs.Add(userOtp);
        await _context.SaveChangesAsync();

        await _emailService.SendOtpEmailAsync(email, otp);

        return otp;
    }

    public async Task<(string Token, User User)?> VerifyOtpAsync(string email, string otp)
    {
        var userOtp = await _context.UserOTPs
            .Where(x => x.Email == email && x.OTP == otp && !x.IsUsed && x.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();

        if (userOtp == null) return null;

        userOtp.IsUsed = true;
        await _context.SaveChangesAsync();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User
            {
                Email = email,
                Name = email.Split('@')[0], // Default name
                Status = "Available"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        var token = GenerateJwtToken(user);

        return (token, user);
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "a_very_long_and_secure_secret_key_for_whatsapp_clone");

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name ?? "")
            }),
            Expires = DateTime.UtcNow.AddDays(30),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"]
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
