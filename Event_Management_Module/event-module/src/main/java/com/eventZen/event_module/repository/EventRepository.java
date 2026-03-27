package com.eventZen.event_module.repository;

import com.eventZen.event_module.entity.Event;
import com.eventZen.event_module.entity.EventCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByIsActiveTrue();

    Optional<Event> findByIdAndIsActiveTrue(Long id);

    List<Event> findByOrganizerIdAndIsActiveTrue(Long organizerId);

    List<Event> findByCategoryAndIsActiveTrue(EventCategory category);
}