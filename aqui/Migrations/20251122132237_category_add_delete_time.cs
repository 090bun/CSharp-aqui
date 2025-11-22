using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aqui.Migrations
{
    /// <inheritdoc />
    public partial class category_add_delete_time : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "category",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "category");
        }
    }
}
