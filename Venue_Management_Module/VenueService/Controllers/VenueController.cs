using Microsoft.AspNetCore.Mvc;
using VenueService.Services;
using VenueService.DTOs;
using Microsoft.AspNetCore.Authorization;


namespace VenueService.Controllers
{
    [ApiController]
    [Route("venues")]
    public class VenueController : ControllerBase
    {
        private readonly VenueServiceImpl _service;

        public VenueController(VenueServiceImpl service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAll());
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            return Ok(await _service.GetById(id));
        }

        [HttpGet("my")]
        [Authorize(Roles = "VENDOR")]
        public async Task<IActionResult> GetMyVenues()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value);
            return Ok(await _service.GetByVendor(userId));
        }


        [HttpPost]
        [Authorize(Roles = "VENDOR,ADMIN")]
        public async Task<IActionResult> Add([FromBody] VenueDTO dto)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value);

            await _service.Add(dto, userId);
            return Ok("Venue added");
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "VENDOR,ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] VenueDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value);
                var role = User.FindFirst("role")?.Value;

                await _service.Update(id, dto, userId, role);

                return Ok("Updated");
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.Delete(id);
            return Ok("Deleted");
        }
    }
}