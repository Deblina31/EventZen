package com.eventZen.event_module.services;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.entity.Event;
import com.eventZen.event_module.mapper.EventMapper;
import com.eventZen.event_module.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepo;

    public EventService(EventRepository eventRepo) {
        this.eventRepo = eventRepo;
    }

    // ✅ FIND ALL: Converts all entities to DTOs
    public java.util.List<EventResponseDTO> findAll() {
        return eventRepo.findAll().stream()
                .map(EventMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }


    public java.util.List<EventResponseDTO> findByUserId(Long userId) {
        if (userId == null) {
            throw new RuntimeException("User ID is missing from request");
        }
        List<Event> events = eventRepo.findByUserId(userId);
        System.out.println("DEBUG: Found " + events.size() + " events in database.");
        return eventRepo.findByUserId(userId).stream()
                .map(EventMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    // ✅ FIND BY ID: Fetches one or throws 404
    public EventResponseDTO findById(Long id) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
        return EventMapper.toDTO(event);
    }


    // ✅ CREATE: Uses your Mapper
    public EventResponseDTO create(EventDTO dto, Long userId) {
        // Convert DTO to Entity using your mapper
        Event event = EventMapper.toEntity(dto, userId);

        // Save to DB and convert back to ResponseDTO
        return EventMapper.toDTO(eventRepo.save(event));
    }

    // ✅ UPDATE: Fetches existing event, updates fields, then saves
    public EventResponseDTO update(Long id, EventDTO dto) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Use your mapper to update fields without creating a new object
        EventMapper.updateEntity(event, dto);

        return EventMapper.toDTO(eventRepo.save(event));
    }

    // ✅ OWNERSHIP CHECK: Required for @PreAuthorize
    public boolean isOwner(Long eventId, Object userIdObj) {
        if (userIdObj == null) return false;

        // Convert the generic object from the request attribute to a Long
        Long userId = Long.valueOf(userIdObj.toString());

        return eventRepo.findById(eventId)
                .map(event -> event.getUserId().equals(userId))
                .orElse(false);
    }

    // ✅ FIXED DELETE METHOD
    public void delete(Long eventId, Long userId) {
        // Use eventRepo (matches your variable name)
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));

        // Ownership check
        if (event.getUserId() == null || !event.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You do not own this event.");
        }

        eventRepo.delete(event);
    }
}