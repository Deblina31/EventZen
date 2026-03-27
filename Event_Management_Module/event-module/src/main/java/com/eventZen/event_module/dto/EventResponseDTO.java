package com.eventZen.event_module.dto;

import com.eventZen.event_module.entity.EventCategory;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponseDTO {

    private Long id;
    private String name;
    private String description;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Long venueId;
    private EventCategory category;
    private Long organizerId;
    private Double totalBudget;
    private Double currentExpenses;
    private Double remainingBudget;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}