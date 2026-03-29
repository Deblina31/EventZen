package com.eventZen.event_module.services;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.entity.Event;
import com.eventZen.event_module.entity.EventCategory;
import com.eventZen.event_module.repository.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepo;

    @InjectMocks
    private EventService eventService;

    private Event sampleEvent;
    private EventDTO sampleDTO;

    @BeforeEach
    void setUp() {
        sampleEvent = Event.builder()
                .id(1L)
                .name("Tech Summit 2026")
                .description("Annual tech conference")
                .startDateTime(LocalDateTime.now().plusDays(10))
                .endDateTime(LocalDateTime.now().plusDays(11))
                .venueId(1L)
                .category(EventCategory.TECH)
                .organizerId(100L)
                .totalBudget(100000.0)
                .venueRent(20000.0)
                .currentExpenses(20000.0)
                .capacity(200)
                .soldTickets(0)
                .earnedRevenue(0.0)
                .standardPrice(500.0)
                .vipPrice(1000.0)
                .premiumPrice(2000.0)
                .isActive(true)
                .build();

        sampleDTO = new EventDTO();
        sampleDTO.setName("Tech Summit 2026");
        sampleDTO.setStartDateTime(LocalDateTime.now().plusDays(10));
        sampleDTO.setEndDateTime(LocalDateTime.now().plusDays(11));
        sampleDTO.setVenueId(1L);
        sampleDTO.setCategory(EventCategory.TECH);
        sampleDTO.setTotalBudget(100000.0);
        sampleDTO.setVenueRent(20000.0);
        sampleDTO.setCapacity(200);
        sampleDTO.setStandardPrice(500.0);
        sampleDTO.setVipPrice(1000.0);
        sampleDTO.setPremiumPrice(2000.0);
    }

    //findAll
    @Test
    @DisplayName("returns list of active events")
    void findAll_returnsActiveEvents() {
        when(eventRepo.findByIsActiveTrue()).thenReturn(List.of(sampleEvent));

        List<EventResponseDTO> result = eventService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Tech Summit 2026");
    }

    @Test
    @DisplayName("returns empty list when no events exist")
    void findAll_returnsEmptyWhenNoEvents() {
        when(eventRepo.findByIsActiveTrue()).thenReturn(List.of());

        List<EventResponseDTO> result = eventService.findAll();

        assertThat(result).isEmpty();
    }

    //findById
    @Test
    @DisplayName("returns event when found")
    void findById_returnsEventWhenFound() {
        when(eventRepo.findByIdAndIsActiveTrue(1L))
                .thenReturn(Optional.of(sampleEvent));

        EventResponseDTO result = eventService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Tech Summit 2026");
    }

    @Test
    @DisplayName("throws EntityNotFoundException when event not found")
    void findById_throwsWhenNotFound() {
        when(eventRepo.findByIdAndIsActiveTrue(99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.findById(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }

    //create
    @Test
    @DisplayName("create saves event and returns DTO")
    void create_savesAndReturnsDTO() {
        when(eventRepo.save(any(Event.class))).thenReturn(sampleEvent);

        EventResponseDTO result = eventService.create(sampleDTO, 100L);

        assertThat(result.getName()).isEqualTo("Tech Summit 2026");
        assertThat(result.getOrganizerId()).isEqualTo(100L);
        verify(eventRepo, times(1)).save(any(Event.class));
    }

    @Test
    @DisplayName("sets venue rent as initial expense")
    void create_setsVenueRentAsInitialExpense() {
        when(eventRepo.save(any(Event.class))).thenReturn(sampleEvent);

        eventService.create(sampleDTO, 100L);

        verify(eventRepo).save(argThat(event ->
                event.getCurrentExpenses().equals(20000.0)
        ));
    }

    //delete
    @Test
    @DisplayName("sets isActive to false")
    void delete_setsIsActiveFalse() {
        when(eventRepo.findByIdAndIsActiveTrue(1L))
                .thenReturn(Optional.of(sampleEvent));
        when(eventRepo.save(any(Event.class))).thenReturn(sampleEvent);

        eventService.delete(1L, 100L, false);

        verify(eventRepo).save(argThat(e -> !e.getIsActive()));
    }

    @Test
    @DisplayName("throws AccessDeniedException when non-owner tries to delete")
    void delete_throwsForNonOwner() {
        when(eventRepo.findByIdAndIsActiveTrue(1L))
                .thenReturn(Optional.of(sampleEvent));

        assertThatThrownBy(() -> eventService.delete(1L, 999L, false))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("admin can delete any event")
    void delete_adminCanDeleteAnyEvent() {
        when(eventRepo.findByIdAndIsActiveTrue(1L))
                .thenReturn(Optional.of(sampleEvent));
        when(eventRepo.save(any(Event.class))).thenReturn(sampleEvent);
        assertThatNoException().isThrownBy(
                () -> eventService.delete(1L, 999L, true)
        );
    }

    //recordTicketSale
    @Test
    @DisplayName("increments soldTickets and earnedRevenue")
    void recordTicketSale_updatesCounters() {
        when(eventRepo.findByIdAndIsActiveTrue(1L))
                .thenReturn(Optional.of(sampleEvent));
        when(eventRepo.save(any(Event.class))).thenReturn(sampleEvent);

        eventService.recordTicketSale(1L, 1000.0, "VIP", 2);

        verify(eventRepo).save(argThat(e ->
                e.getSoldTickets() == 2 &&
                        e.getEarnedRevenue() == 1000.0
        ));
    }

    @Test
    @DisplayName("throws when event is fully booked")
    void recordTicketSale_throwsWhenFullyBooked() {
        sampleEvent.setSoldTickets(200);
        when(eventRepo.findByIdAndIsActiveTrue(1L))
                .thenReturn(Optional.of(sampleEvent));

        assertThatThrownBy(() -> eventService.recordTicketSale(1L, 500.0, "STANDARD", 1))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("capacity");
    }

    //updateExpenses
    @Test
    @DisplayName("adds to currentExpenses")
    void updateExpenses_addsToCurrentExpenses() {
        when(eventRepo.findByIdAndIsActiveTrue(1L))
                .thenReturn(Optional.of(sampleEvent));
        when(eventRepo.save(any(Event.class))).thenReturn(sampleEvent);

        eventService.updateExpenses(1L, 5000.0, 100L, false);

        verify(eventRepo).save(argThat(e ->
                e.getCurrentExpenses() == 25000.0
        ));
    }
}