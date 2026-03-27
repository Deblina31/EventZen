using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenueService.Models
{
    public class Venue
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(255)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(50)]
        public string City { get; set; } = string.Empty;

        [MaxLength(50)]
        public string State { get; set; } = string.Empty;

        [MaxLength(20)]
        public string ZipCode { get; set; } = string.Empty;

        public int Capacity { get; set; }

        public string? Amenities { get; set; }

        public string? Description { get; set; }

        [MaxLength(255)]
        public string? ImageUrl { get; set; }

        public int OwnerId { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }= DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }= DateTime.UtcNow;
        public string? ModifiedBy { get; set; }

        public ICollection<VenueAvailability> Availabilities { get; set; } = new List<VenueAvailability>();
    }
}