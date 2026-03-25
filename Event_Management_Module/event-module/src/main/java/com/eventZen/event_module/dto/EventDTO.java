package com.eventZen.event_module.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {

    private String title;
    private String description;
    private LocalDateTime eventDate;

    private Long venueId;
}