package com.eventZen.event_module.dto;

import com.eventZen.event_module.entity.EventCategory;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {

    @NotBlank(message = "Event name is required")
    private String name;

    private String description;

    @NotNull(message = "Start date/time is required")
    private LocalDateTime startDateTime;

    @NotNull(message = "End date/time is required")
    private LocalDateTime endDateTime;

    @NotNull(message = "Venue is required")
    private Long venueId;

    private EventCategory category;

    @PositiveOrZero(message = "Budget cannot be negative")
    private Double totalBudget;

    @PositiveOrZero(message = "Ticket price cannot be negative")
    private Double ticketPrice;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @PositiveOrZero
    private Double venueRent;

    @PositiveOrZero
    private Double standardPrice;

    @PositiveOrZero
    private Double vipPrice;

    @PositiveOrZero
    private Double premiumPrice;
}