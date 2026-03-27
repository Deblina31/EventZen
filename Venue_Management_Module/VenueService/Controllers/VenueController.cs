using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VenueService.DTOs;
using VenueService.Services;

namespace VenueService.Controllers
{
    [ApiController]
    [Route("api/v1/venues")]
    [Authorize]
    public class VenueController : ControllerBase
    {
        private readonly VenueServiceImpl _service;

        public VenueController(VenueServiceImpl service)
        {
            _service = service;
        }

        // private int GetUserId()
        //     => int.Parse(User.FindFirst("userId")?.Value ?? "0");

        private int GetUserId()
{
    var claim = User.FindFirst("userId")?.Value;
    return int.TryParse(claim, out int id) ? id : 0;
}

       private string GetRole()
    => User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? string.Empty;

        //GET all 
        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _service.GetAll());

        //GET by id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
            => Ok(await _service.GetById(id));

        // //GET their created venues
        // [HttpGet("my")]
        // [Authorize(Roles = "VENDOR,ADMIN")]
        // public async Task<IActionResult> GetMy()
        // {
        //     var userId = GetUserId();
        //     var role   = GetRole();

        //     //all venues for admin
        //     if (role == "ADMIN")
        //         return Ok(await _service.GetAll());

        //     return Ok(await _service.GetByVendor(userId));
        // }

        [HttpGet("my")]
[Authorize(Roles = "VENDOR,ADMIN")]
public async Task<IActionResult> GetMy()
{
    var userId = GetUserId();
    var allVenues = await _service.GetAll();
    
    // We return all, but the frontend will check v.ownerId === currentUserId
    return Ok(allVenues); 
}

        //POST/ Create a new venue
        [HttpPost]
        [Authorize(Roles = "VENDOR,ADMIN")]
        public async Task<IActionResult> Add([FromBody] VenueDTO dto)
        {

            var detectedRoles = User.FindAll("role").Select(c => c.Value);
            Console.WriteLine($"Detected Roles: {string.Join(", ", detectedRoles)}");

            if (!User.IsInRole("VENDOR")) {
        return Forbid("System did not recognize the VENDOR role in the token.");
    }

            var userId = GetUserId();
            var result = await _service.Add(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        //PUT/ Update a venue
        [HttpPut("{id}")]
        [Authorize(Roles = "VENDOR,ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] VenueDTO dto)
        {
            var userId = GetUserId();
            var role   = GetRole();
            var result = await _service.Update(id, dto, userId, role);
            return Ok(result);
        }

        //DELETE a venue
        [HttpDelete("{id}")]
        [Authorize(Roles = "VENDOR,ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();
            var role   = GetRole();
            await _service.Delete(id, userId, role);
            return NoContent();
        }
    }
}