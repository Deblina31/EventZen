package com.eventZen.event_module.mapper;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.entity.Event;

public class EventMapper {

    public static EventResponseDTO toDTO(Event event) {
        double total = event.getTotalBudget() != null ? event.getTotalBudget() : 0.0;
        double spent = event.getCurrentExpenses() != null ? event.getCurrentExpenses() : 0.0;

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
                .isActive(event.getIsActive())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }

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
                .currentExpenses(0.0)
                .isActive(true)
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
    }
}