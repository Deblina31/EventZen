package com.eventZen.event_module.mapper;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.entity.Event;

public class EventMapper {

    public static Event toEntity(EventDTO dto, Long organizerId) {
        return Event.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDateTime(dto.getStartDateTime())
                .endDateTime(dto.getEndDateTime())
                .venueId(dto.getVenueId())
                .category(dto.getCategory())
                .organizerId(organizerId)
                .totalBudget(dto.getTotalBudget())
                .currentExpenses(dto.getVenueRent() != null ? dto.getVenueRent() : 0.0)
                .venueRent(dto.getVenueRent() != null ? dto.getVenueRent() : 0.0)
                .capacity(dto.getCapacity() != null ? dto.getCapacity() : 0)
                .soldTickets(0)
                .standardPrice(dto.getStandardPrice() != null ? dto.getStandardPrice() : 0.0)
                .vipPrice(dto.getVipPrice() != null ? dto.getVipPrice() : 0.0)
                .premiumPrice(dto.getPremiumPrice() != null ? dto.getPremiumPrice() : 0.0)
                .isActive(true)
                .build();
    }

    public static EventResponseDTO toDTO(Event event) {
        double total   = event.getTotalBudget()      != null ? event.getTotalBudget()      : 0.0;
        double spent   = event.getCurrentExpenses()  != null ? event.getCurrentExpenses()  : 0.0;
        int    sold    = event.getSoldTickets()       != null ? event.getSoldTickets()       : 0;
        int    cap     = event.getCapacity()          != null ? event.getCapacity()          : 0;
        double earned  = event.getEarnedRevenue()    != null ? event.getEarnedRevenue()    : 0.0;
        double balance = earned - spent;

        return EventResponseDTO.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .startDateTime(event.getStartDateTime())
                .endDateTime(event.getEndDateTime())
                .venueId(event.getVenueId())
                .category(event.getCategory())
                .organizerId(event.getOrganizerId())
                .totalBudget(total)
                .currentExpenses(spent)
                .remainingBudget(total - spent)
                .venueRent(event.getVenueRent())
                .capacity(cap)
                .soldTickets(sold)
                .availableCapacity(cap - sold)
                .standardPrice(event.getStandardPrice())
                .vipPrice(event.getVipPrice())
                .premiumPrice(event.getPremiumPrice())
                .earnedRevenue(earned)
                .currentBalance(balance)
                .isActive(event.getIsActive())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }

    public static void updateEntity(Event event, EventDTO dto) {
        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setStartDateTime(dto.getStartDateTime());
        event.setEndDateTime(dto.getEndDateTime());
        event.setVenueId(dto.getVenueId());
        event.setCategory(dto.getCategory());
        event.setTotalBudget(dto.getTotalBudget());
        event.setCapacity(dto.getCapacity());
        event.setStandardPrice(dto.getStandardPrice());
        event.setVipPrice(dto.getVipPrice());
        event.setPremiumPrice(dto.getPremiumPrice());
        if (dto.getVenueRent() != null) {
            event.setVenueRent(dto.getVenueRent());
            event.setCurrentExpenses(dto.getVenueRent());
        }
    }
}