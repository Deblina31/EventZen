package com.eventZen.event_module.repository;

import com.eventZen.event_module.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {


    List<Event> findByUserId(Long userId);
}