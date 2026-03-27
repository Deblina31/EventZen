using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VenueService.DTOs;
using VenueService.Services;

namespace VenueService.Controllers
{
    [ApiController]
    [Route("api/v1/venues/{venueId}/availability")]
    [Authorize]
    public class VenueAvailabilityController : ControllerBase
    {
        private readonly VenueServiceImpl _service;

        public VenueAvailabilityController(VenueServiceImpl service)
        {
            _service = service;
        }

        private int GetUserId()
            => int.Parse(User.FindFirst("userId")?.Value ?? "0");

        private string GetRole()
            => User.FindFirst("role")?.Value ?? string.Empty;

        //GET all slots for a venue only for logged in users
        [HttpGet]
        public async Task<IActionResult> GetAvailability(int venueId)
            => Ok(await _service.GetAvailability(venueId));

        //POST/ add slot (VENDOR or ADMIN)
        [HttpPost]
        [Authorize(Roles = "VENDOR,ADMIN")]
        public async Task<IActionResult> AddSlot(
            int venueId,
            [FromBody] VenueAvailabilityRequestDTO dto)
        {
            var userId = GetUserId();
            var role   = GetRole();
            var result = await _service.AddAvailability(venueId, dto, userId, role);
            return CreatedAtAction(nameof(GetAvailability), new { venueId }, result);
        }

        //DELETE slot (VENDOR or ADMIN)
        [HttpDelete("{slotId}")]
        [Authorize(Roles = "VENDOR,ADMIN")]
        public async Task<IActionResult> DeleteSlot(int venueId, int slotId)
        {
            var userId = GetUserId();
            var role   = GetRole();
            await _service.DeleteAvailability(venueId, slotId, userId, role);
            return NoContent();
        }
    }
}