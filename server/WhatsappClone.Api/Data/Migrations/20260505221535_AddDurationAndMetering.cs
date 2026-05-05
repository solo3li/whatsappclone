using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WhatsappClone.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDurationAndMetering : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Duration",
                table: "Messages",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Metering",
                table: "Messages",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "Metering",
                table: "Messages");
        }
    }
}
