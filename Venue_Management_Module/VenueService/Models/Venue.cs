using System.ComponentModel.DataAnnotations;

namespace VenueService.Models
{
    public class Venue
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public string Location { get; set; }

        public int Capacity { get; set; }

        public int OwnerId { get; set; }
    }
}