using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aqui.Migrations
{
    /// <inheritdoc />
    public partial class addSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SpicyLevel",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "news");

            migrationBuilder.AddColumn<bool>(
                name: "Spicy",
                table: "order_items",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "order",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "menu",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Spicy",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "menu");

            migrationBuilder.AddColumn<int>(
                name: "SpicyLevel",
                table: "order_items",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "order",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "news",
                type: "datetime(6)",
                nullable: true);
        }
    }
}
