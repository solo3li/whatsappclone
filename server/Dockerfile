# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["WhatsappClone.Api/WhatsappClone.Api.csproj", "WhatsappClone.Api/"]
RUN dotnet restore "WhatsappClone.Api/WhatsappClone.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/WhatsappClone.Api"
RUN dotnet build "WhatsappClone.Api.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "WhatsappClone.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# SQLite database file will be created in /app
# Ensure the directory is writable
RUN mkdir -p /app/data && chown -R 1000:1000 /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "WhatsappClone.Api.dll"]
