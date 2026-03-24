using VenueService.Models;

namespace VenueService.Repositories
{
    public interface IVenueRepository
    {
        Task<List<Venue>> GetAll();
        Task<Venue> GetById(int id);
        Task<List<Venue>> GetByVendor(int userId);
        Task Add(Venue venue);
        Task Delete(int id);
        Task Save();
    }
}