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
        public async Task<List<VenueResponseDTO>> GetAll()
            => (await _repo.GetAllActive()).Select(MapToResponse).ToList();

        public async Task<VenueResponseDTO> GetById(int id)
        {
            var venue = await _repo.GetById(id)
                ?? throw new KeyNotFoundException($"Venue {id} not found");
            return MapToResponse(venue);
        }

        public async Task<List<VenueResponseDTO>> GetByVendor(int ownerId)
            => (await _repo.GetByVendor(ownerId)).Select(MapToResponse).ToList();

        public async Task<VenueResponseDTO> Add(VenueDTO dto, int ownerId)
        {
            var venue = new Venue
            {
                Name        = dto.Name,
                Address     = dto.Address,
                City        = dto.City,
                State       = dto.State,
                ZipCode     = dto.ZipCode,
                Capacity    = dto.Capacity,
                Amenities   = dto.Amenities,
                Description = dto.Description,
                ImageUrl    = dto.ImageUrl,
                OwnerId     = ownerId,
                IsActive    = true,
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow,
                ModifiedBy  = ownerId.ToString()
            };

            await _repo.Add(venue);
            await _repo.Save();
            return MapToResponse(venue);
        }

        public async Task<VenueResponseDTO> Update(
            int id, VenueDTO dto, int requesterId, string role)
        {
            var venue = await _repo.GetById(id)
                ?? throw new KeyNotFoundException($"Venue {id} not found");

            if (role == "VENDOR" && venue.OwnerId != requesterId)
                throw new UnauthorizedAccessException("You can only update your own venues");

            venue.Name        = dto.Name;
            venue.Address     = dto.Address;
            venue.City        = dto.City;
            venue.State       = dto.State;
            venue.ZipCode     = dto.ZipCode;
            venue.Capacity    = dto.Capacity;
            venue.Amenities   = dto.Amenities;
            venue.Description = dto.Description;
            venue.ImageUrl    = dto.ImageUrl;
            venue.UpdatedAt   = DateTime.UtcNow;
            venue.ModifiedBy  = requesterId.ToString();

            await _repo.Save();
            return MapToResponse(venue);
        }

        public async Task Delete(int id, int requesterId, string role)
        {
            var venue = await _repo.GetById(id)
                ?? throw new KeyNotFoundException($"Venue {id} not found");

            if (role == "VENDOR" && venue.OwnerId != requesterId)
                throw new UnauthorizedAccessException("You can only delete your own venues");

            venue.IsActive   = false;
            venue.UpdatedAt  = DateTime.UtcNow;
            venue.ModifiedBy = requesterId.ToString();

            await _repo.Save();
        }
        public async Task<List<VenueAvailabilityResponseDTO>> GetAvailability(int venueId)
            => (await _repo.GetAvailability(venueId)).Select(MapAvailabilityToResponse).ToList();

        public async Task<VenueAvailabilityResponseDTO> AddAvailability(
            int venueId, VenueAvailabilityRequestDTO dto, int requesterId, string role)
        {
            var venue = await _repo.GetById(venueId)
                ?? throw new KeyNotFoundException($"Venue {venueId} not found");

            if (role == "VENDOR" && venue.OwnerId != requesterId)
                throw new UnauthorizedAccessException("You can only add availability to your own venues");

            var slot = new VenueAvailability
            {
                VenueId     = venueId,
                Date        = dto.Date,
                StartTime   = dto.StartTime,
                EndTime     = dto.EndTime,
                IsAvailable = dto.IsAvailable,
                UpdatedAt   = DateTime.UtcNow
            };

            await _repo.AddAvailability(slot);
            await _repo.Save();
            return MapAvailabilityToResponse(slot);
        }

        public async Task DeleteAvailability(int venueId, int slotId,
            int requesterId, string role)
        {
            var slot = await _repo.GetAvailabilitySlot(slotId)
                ?? throw new KeyNotFoundException($"Availability slot {slotId} not found");

            if (slot.VenueId != venueId)
                throw new KeyNotFoundException("Slot does not belong to this venue");

            if (role == "VENDOR" && slot.Venue.OwnerId != requesterId)
                throw new UnauthorizedAccessException("You can only delete slots for your own venues");

            await _repo.DeleteAvailability(slotId);
            await _repo.Save();
        }
        private static VenueResponseDTO MapToResponse(Venue v) => new()
        {
            Id          = v.Id,
            Name        = v.Name,
            Address     = v.Address,
            City        = v.City,
            State       = v.State,
            ZipCode     = v.ZipCode,
            Capacity    = v.Capacity,
            Amenities   = v.Amenities,
            Description = v.Description,
            ImageUrl    = v.ImageUrl,
            OwnerId     = v.OwnerId,
            IsActive    = v.IsActive,
            CreatedAt   = v.CreatedAt,
            UpdatedAt   = v.UpdatedAt
        };

        private static VenueAvailabilityResponseDTO MapAvailabilityToResponse(
            VenueAvailability a) => new()
        {
            Id          = a.Id,
            VenueId     = a.VenueId,
            Date        = a.Date,
            StartTime   = a.StartTime,
            EndTime     = a.EndTime,
            IsAvailable = a.IsAvailable,
            UpdatedAt   = a.UpdatedAt
        };
    }
}