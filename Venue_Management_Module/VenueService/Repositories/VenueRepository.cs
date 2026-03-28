using Microsoft.EntityFrameworkCore;
using VenueService.Data;
using VenueService.Models;

namespace VenueService.Repositories
{
    public class VenueRepository : IVenueRepository
    {
        private readonly AppDbContext _context;

        public VenueRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<Venue>> GetAllActive()
            => await _context.Venues
                .Where(v => v.IsActive)
                .ToListAsync();

        public async Task<Venue?> GetById(int id)
            => await _context.Venues
                .FirstOrDefaultAsync(v => v.Id == id && v.IsActive);

        public async Task<List<Venue>> GetByVendor(int ownerId)
            => await _context.Venues
                .Where(v => v.OwnerId == ownerId && v.IsActive)
                .ToListAsync();

        public async Task Add(Venue venue)
            => await _context.Venues.AddAsync(venue);

        public async Task Save()
            => await _context.SaveChangesAsync();

    }
}