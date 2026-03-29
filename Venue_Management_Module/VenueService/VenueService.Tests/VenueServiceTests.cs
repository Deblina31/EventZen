using FluentAssertions;
using Moq;
using VenueService.DTOs;
using VenueService.Models;
using VenueService.Repositories;
using VenueService.Services;
using Xunit;

namespace VenueService.Tests;

public class VenueServiceTests
{
    private readonly Mock<IVenueRepository> _repoMock;
    private readonly VenueServiceImpl _service;

    public VenueServiceTests()
    {
        _repoMock = new Mock<IVenueRepository>();
        _service  = new VenueServiceImpl(_repoMock.Object);
    }

    private static Venue SampleVenue(int id = 1, int ownerId = 10) => new()
    {
        Id          = id,
        Name        = "Grand Ballroom",
        City        = "Mumbai",
        Address     = "123 Main St",
        State       = "MH",
        ZipCode     = "400001",
        Capacity    = 300,
        OwnerId     = ownerId,
        IsActive    = true,
        CreatedAt   = DateTime.UtcNow,
        UpdatedAt   = DateTime.UtcNow,
    };

    private static VenueDTO SampleDTO() => new()
    {
        Name     = "Grand Ballroom",
        City     = "Mumbai",
        Address  = "123 Main St",
        Capacity = 300,
    };

    [Fact]
    public async Task GetAll_ReturnsActiveVenues()
    {
        _repoMock.Setup(r => r.GetAllActive())
                 .ReturnsAsync(new List<Venue> { SampleVenue() });

        var result = await _service.GetAll();

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Grand Ballroom");
    }

    [Fact]
    public async Task GetAll_ReturnsEmptyList_WhenNoVenues()
    {
        _repoMock.Setup(r => r.GetAllActive())
                 .ReturnsAsync(new List<Venue>());

        var result = await _service.GetAll();

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetById_ReturnsVenue_WhenFound()
    {
        _repoMock.Setup(r => r.GetById(1))
                 .ReturnsAsync(SampleVenue());

        var result = await _service.GetById(1);

        result.Should().NotBeNull();
        result.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetById_ThrowsKeyNotFound_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetById(99))
                 .ReturnsAsync((Venue?)null);

        await _service.Invoking(s => s.GetById(99))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*99*");
    }

    [Fact]
    public async Task Add_CreatesVenueAndReturnsDTO()
    {
        _repoMock.Setup(r => r.Add(It.IsAny<Venue>()))
                 .Returns(Task.CompletedTask);
        _repoMock.Setup(r => r.Save())
                 .Returns(Task.CompletedTask);

        var result = await _service.Add(SampleDTO(), ownerId: 10);

        result.Should().NotBeNull();
        result.Name.Should().Be("Grand Ballroom");
        result.OwnerId.Should().Be(10);
        _repoMock.Verify(r => r.Add(It.IsAny<Venue>()), Times.Once);
        _repoMock.Verify(r => r.Save(), Times.Once);
    }

    [Fact]
    public async Task Update_UpdatesVenue_WhenOwner()
    {
        _repoMock.Setup(r => r.GetById(1)).ReturnsAsync(SampleVenue(ownerId: 10));
        _repoMock.Setup(r => r.Save()).Returns(Task.CompletedTask);

        var result = await _service.Update(1, SampleDTO(), requesterId: 10, role: "VENDOR");

        result.Should().NotBeNull();
        _repoMock.Verify(r => r.Save(), Times.Once);
    }

    [Fact]
    public async Task Update_ThrowsUnauthorized_WhenNotOwner()
    {
        _repoMock.Setup(r => r.GetById(1)).ReturnsAsync(SampleVenue(ownerId: 10));

        await _service.Invoking(s => s.Update(1, SampleDTO(),
                requesterId: 99, role: "VENDOR"))
            .Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Update_AllowsAdmin_ToUpdateAnyVenue()
    {
        _repoMock.Setup(r => r.GetById(1)).ReturnsAsync(SampleVenue(ownerId: 10));
        _repoMock.Setup(r => r.Save()).Returns(Task.CompletedTask);
        await _service.Invoking(s => s.Update(1, SampleDTO(),
                requesterId: 999, role: "ADMIN"))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task Delete_SetsIsActiveFalse_WhenOwner()
    {
        var venue = SampleVenue(ownerId: 10);
        _repoMock.Setup(r => r.GetById(1)).ReturnsAsync(venue);
        _repoMock.Setup(r => r.Save()).Returns(Task.CompletedTask);

        await _service.Delete(1, requesterId: 10, role: "VENDOR");

        venue.IsActive.Should().BeFalse();
        _repoMock.Verify(r => r.Save(), Times.Once);
    }

    [Fact]
    public async Task Delete_ThrowsUnauthorized_WhenNotOwner()
    {
        _repoMock.Setup(r => r.GetById(1)).ReturnsAsync(SampleVenue(ownerId: 10));

        await _service.Invoking(s => s.Delete(1, requesterId: 99, role: "VENDOR"))
            .Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Delete_ThrowsKeyNotFound_WhenVenueNotFound()
    {
        _repoMock.Setup(r => r.GetById(99)).ReturnsAsync((Venue?)null);

        await _service.Invoking(s => s.Delete(99, requesterId: 1, role: "ADMIN"))
            .Should().ThrowAsync<KeyNotFoundException>();
    }
}