using System.ComponentModel.DataAnnotations;

namespace VenueService.DTOs
{
    public class VenueAvailabilityRequestDTO
    {
        [Required]
        public DateOnly Date { get; set; }

        [Required]
        public TimeOnly StartTime { get; set; }

        [Required]
        public TimeOnly EndTime { get; set; }

        public bool IsAvailable { get; set; } = true;
    }

    public class VenueAvailabilityResponseDTO
    {
        public int Id { get; set; }
        public int VenueId { get; set; }
        public DateOnly Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}