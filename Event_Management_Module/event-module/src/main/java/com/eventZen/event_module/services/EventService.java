package com.eventZen.event_module.services;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.entity.Event;
import com.eventZen.event_module.mapper.EventMapper;
import com.eventZen.event_module.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepo;

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

    public EventResponseDTO findById(Long id) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
        return EventMapper.toDTO(event);
    }

    public EventResponseDTO create(EventDTO dto, Long userId) {
        Event event = EventMapper.toEntity(dto, userId);
        return EventMapper.toDTO(eventRepo.save(event));
    }
    public EventResponseDTO update(Long id, EventDTO dto) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        EventMapper.updateEntity(event, dto);

        return EventMapper.toDTO(eventRepo.save(event));
    }
    public boolean isOwner(Long eventId, Object userIdObj) {
        if (userIdObj == null) return false;
        Long userId = Long.valueOf(userIdObj.toString());

        return eventRepo.findById(eventId)
                .map(event -> event.getUserId().equals(userId))
                .orElse(false);
    }
    public void delete(Long eventId, Long userId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));
        if (event.getUserId() == null || !event.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You do not own this event.");
        }
        eventRepo.delete(event);
    }
}