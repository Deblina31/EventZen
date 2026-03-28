using Microsoft.EntityFrameworkCore;
using VenueService.Models;

namespace VenueService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Venue> Venues { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Venue>(entity =>
            {
                entity.Property(e => e.CreatedAt)
                      .ValueGeneratedNever(); 

                entity.Property(e => e.UpdatedAt)
                      .ValueGeneratedNever();
                
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Address).HasMaxLength(255).IsRequired();
            });

        }
    }
}