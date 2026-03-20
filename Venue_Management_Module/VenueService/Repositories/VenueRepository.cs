using VenueService.Data;
using VenueService.Models;
using Microsoft.EntityFrameworkCore;

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

        public async Task Add(Venue venue)
        {
            await _context.Venues.AddAsync(venue);
        }

        public async Task Delete(int id)
        {
            var venue = await GetById(id);
            if (venue != null)
                _context.Venues.Remove(venue);
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }
    }
}