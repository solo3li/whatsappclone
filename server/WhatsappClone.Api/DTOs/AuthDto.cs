namespace WhatsappClone.Api.DTOs;

public record OtpRequest(string Email);
public record OtpVerifyRequest(string Email, string Otp);
public record AuthResponse(string Token, UserDto User);
public record UserDto(Guid Id, string Email, string Name, string Avatar, string Status);
public record ChatDto(Guid Id, string Name, string Avatar, string LastMessage, DateTime LastMessageTime, int UnreadCount);
public record MessageDto(Guid Id, string Text, Guid SenderId, string SenderName, DateTime Time, bool IsMe, string? Image, string? Audio, string? FileUri, string? FileName, string? FileSize, Guid? ReplyToId, string? ReplyText, double? Duration = null, string? Metering = null);
public record CreateChatRequest(Guid UserId);
public record StatusUpdateDto(string Image, string Caption);
