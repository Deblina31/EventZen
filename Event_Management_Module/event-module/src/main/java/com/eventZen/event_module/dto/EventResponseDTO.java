package com.eventZen.event_module.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponseDTO {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime eventDate;

    private Long venueId;
    private Long userId;
}