using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WhatsappClone.Api.Data;
using WhatsappClone.Api.Hubs;
using WhatsappClone.Api.Services;
using WhatsappClone.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<WhatsappDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "a_very_long_and_secure_secret_key_for_whatsapp_clone");

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true
    };
    
    // SignalR Authentication
    x.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Real-time
builder.Services.AddSignalR();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IStatusService, StatusService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed(_ => true)
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
// Temporarily enable Developer Exception Page in Production to debug the 500 error
app.UseDeveloperExceptionPage();

// Always enable Swagger for testing during this phase
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Whatsapp Clone API v1");
    c.RoutePrefix = "swagger"; // Access at /swagger
});

app.UseCors();

// Ensure wwwroot exists and set it as WebRoot if it's not found
if (string.IsNullOrEmpty(app.Environment.WebRootPath))
{
    app.Environment.WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
}

if (!Directory.Exists(app.Environment.WebRootPath))
{
    Directory.CreateDirectory(app.Environment.WebRootPath);
}

var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
provider.Mappings[".m4a"] = "audio/x-m4a";
provider.Mappings[".mp3"] = "audio/mpeg";
provider.Mappings[".wav"] = "audio/wav";
provider.Mappings[".ogg"] = "audio/ogg";

app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider
});

// Ensure Database is created and migrated
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var db = scope.ServiceProvider.GetRequiredService<WhatsappDbContext>();
        db.Database.Migrate();
        await DbSeeder.SeedAsync(db);
        Console.WriteLine("Database migration and seeding successful.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred while migrating the database: {ex.Message}");
    }
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=AdminPanel}/{action=Dashboard}/{id?}");

app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

app.Run();
