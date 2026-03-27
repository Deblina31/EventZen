using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenueService.Models
{
    public class VenueAvailability
    {
        public int Id { get; set; }

        [Required]
        public int VenueId { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        [Required]
        public TimeOnly StartTime { get; set; }

        [Required]
        public TimeOnly EndTime { get; set; }

        public bool IsAvailable { get; set; } = true;

        public DateTime UpdatedAt { get; set; }
        
        [ForeignKey("VenueId")]
        public Venue Venue { get; set; } = null!;
    }
}