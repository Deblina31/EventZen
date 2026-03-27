using VenueService.Models;

namespace VenueService.Repositories
{
    public interface IVenueRepository
    {
        Task<List<Venue>> GetAllActive();
        Task<Venue?> GetById(int id);
        Task<List<Venue>> GetByVendor(int ownerId);
        Task Add(Venue venue);
        Task Save();

        Task<List<VenueAvailability>> GetAvailability(int venueId);
        Task<VenueAvailability?> GetAvailabilitySlot(int slotId);
        Task AddAvailability(VenueAvailability slot);
        Task DeleteAvailability(int slotId);
    }
}