using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VenueService.Migrations
{
    /// <inheritdoc />
    public partial class AddOwnerIdToVenue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OwnerId",
                table: "Venues",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Venues");
        }
    }
}
