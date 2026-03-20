using Microsoft.EntityFrameworkCore;
using VenueService.Models;

namespace VenueService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) {}

        public DbSet<Venue> Venues { get; set; }
    }
}