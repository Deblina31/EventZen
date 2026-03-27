using Microsoft.EntityFrameworkCore;
using VenueService.Models;

namespace VenueService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Venue> Venues { get; set; }
        public DbSet<VenueAvailability> VenueAvailabilities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Venue>(entity =>
            {
                // We remove .HasDefaultValueSql to avoid the MySQL "Invalid default value" error.
                // EF Core will now use the DateTime.UtcNow you set in your Venue class.
                entity.Property(e => e.CreatedAt)
                      .ValueGeneratedNever(); 

                entity.Property(e => e.UpdatedAt)
                      .ValueGeneratedNever();
                
                // Ensure Name and Address have specific lengths to match your database
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Address).HasMaxLength(255).IsRequired();
            });

            modelBuilder.Entity<VenueAvailability>(entity =>
            {
                // Removing database-side logic here as well for consistency
                entity.Property(e => e.UpdatedAt)
                      .ValueGeneratedNever();

                entity.HasOne(a => a.Venue)
                      .WithMany(v => v.Availabilities)
                      .HasForeignKey(a => a.VenueId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}