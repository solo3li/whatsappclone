using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using WhatsappClone.Api.Services.Interfaces;

namespace WhatsappClone.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendOtpEmailAsync(string email, string otp)
    {
        var hostMail = _configuration["HOST_MAIL"];
        var hostPass = _configuration["HOST_MAIL_PASS"];

        if (string.IsNullOrEmpty(hostMail) || string.IsNullOrEmpty(hostPass))
        {
            // For development purposes, we might want to log this instead of throwing
            Console.WriteLine($"OTP for {email}: {otp} (Email not sent because HOST_MAIL or HOST_MAIL_PASS is missing)");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("WhatsApp Clone", hostMail));
        message.To.Add(new MailboxAddress("", email));
        message.Subject = "Your WhatsApp Clone Verification Code";

        var htmlBody = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {{ font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ color: #25D366; font-size: 24px; font-weight: bold; }}
                .content {{ text-align: center; color: #333; }}
                .otp {{ font-size: 32px; font-weight: bold; color: #075E54; letter-spacing: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #999; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='logo'>WhatsApp Clone</div>
                </div>
                <div class='content'>
                    <h2>Verify your email</h2>
                    <p>Use the following code to complete your registration:</p>
                    <div class='otp'>{otp}</div>
                    <p>This code will expire in 10 minutes.</p>
                </div>
                <div class='footer'>
                    &copy; 2026 WhatsApp Clone. All rights reserved.
                </div>
            </div>
        </body>
        </html>";

        message.Body = new TextPart(TextFormat.Html) { Text = htmlBody };

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(hostMail, hostPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending email: {ex.Message}");
        }
    }
}
