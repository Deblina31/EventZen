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

        public async Task<List<Venue>> GetAll()
        {
            return await _context.Venues.ToListAsync();
        }

        public async Task<Venue> GetById(int id)
        {
            return await _context.Venues.FindAsync(id);
        }

        public async Task<List<Venue>> GetByVendor(int userId)
        {
            return await _context.Venues
                .Where(v => v.OwnerId == userId)
                .ToListAsync();
        }

        public async Task Add(Venue venue)
        {
            await _context.Venues.AddAsync(venue);
        }

        public async Task Delete(int id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue != null)
            {
                _context.Venues.Remove(venue);
            }
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }
    }
}