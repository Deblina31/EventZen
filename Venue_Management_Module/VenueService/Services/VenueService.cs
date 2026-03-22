using VenueService.DTOs;
using VenueService.Models;
using VenueService.Repositories;

namespace VenueService.Services
{
    public class VenueServiceImpl
    {
        private readonly IVenueRepository _repo;

        public VenueServiceImpl(IVenueRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Venue>> GetAll()
        {
            return await _repo.GetAll();
        }

        public async Task<Venue> GetById(int id)
        {
            return await _repo.GetById(id);
        }

        public async Task Add(VenueDTO dto, int userId)
        {
            var venue = new Venue
            {
                Name = dto.Name,
                Location = dto.Location,
                Capacity = dto.Capacity,
                OwnerId = userId
            };

            await _repo.Add(venue);
            await _repo.Save();
        }

        public async Task Update(int id, VenueDTO dto, int userId, string role)
{
    var venue = await _repo.GetById(id);

    if (venue == null)
        throw new Exception("Venue not found");

    if (role == "VENDOR" && venue.OwnerId != userId)
    {
        throw new UnauthorizedAccessException("Not your venue");
    }

    venue.Name = dto.Name;
    venue.Location = dto.Location;
    venue.Capacity = dto.Capacity;

    await _repo.Save();
}

        public async Task Delete(int id)
        {
            await _repo.Delete(id);
            await _repo.Save();
        }

        
    }
}