package com.eventZen.event_module.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;


@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime startDateTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime endDateTime;

    @Column(nullable = false)
    private Long venueId;

    @Enumerated(EnumType.ORDINAL)
    private EventCategory category;

    @Column(nullable = false)
    private Long organizerId;

    private Double totalBudget;
    private Double currentExpenses;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String modifiedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Column(nullable = false)
    @Builder.Default
    private Double ticketPrice = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer soldTickets = 0;

    @Column(nullable = false)
    @Builder.Default
    private Double venueRent = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double standardPrice = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double vipPrice = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double premiumPrice = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double earnedRevenue = 0.0;
}