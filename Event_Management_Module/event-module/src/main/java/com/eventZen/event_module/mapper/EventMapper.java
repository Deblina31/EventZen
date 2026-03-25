package com.eventZen.event_module.mapper;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.entity.Event;

public class EventMapper {

    public static Event toEntity(EventDTO dto, Long userId) {
        return Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .eventDate(dto.getEventDate())
                .userId(userId)
                .venueId(dto.getVenueId())
                .build();
    }

    public static EventResponseDTO toDTO(Event event) {
        double budget = event.getTotalBudget() != null ? event.getTotalBudget() : 0.0;
        double expenses = event.getCurrentExpenses() != null ? event.getCurrentExpenses() : 0.0;


        return EventResponseDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .userId(event.getUserId())
                .venueId(event.getVenueId())
                .totalBudget(budget)
                .currentExpenses(expenses)
                .remainingBudget(budget - expenses)
                .build();
    }

    public static void updateEntity(Event event, EventDTO dto) {
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setVenueId(dto.getVenueId());
    }
}