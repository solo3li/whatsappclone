using Microsoft.AspNetCore.Mvc;
using WhatsappClone.Api.DTOs;
using WhatsappClone.Api.Services.Interfaces;

namespace WhatsappClone.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("request-otp")]
    public async Task<IActionResult> RequestOtp([FromBody] OtpRequest request)
    {
        await _authService.RequestOtpAsync(request.Email);
        return Ok(new { message = "OTP sent successfully" });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] OtpVerifyRequest request)
    {
        var result = await _authService.VerifyOtpAsync(request.Email, request.Otp);
        if (result == null) return BadRequest(new { message = "Invalid or expired OTP" });

        var (token, user) = result.Value;
        var userDto = new UserDto(user.Id, user.Email, user.Name ?? "", user.AvatarUrl ?? "", user.Status ?? "");
        
        return Ok(new AuthResponse(token, userDto));
    }
}
