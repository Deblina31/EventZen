package com.eventZen.event_module.services;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.entity.Event;
import com.eventZen.event_module.mapper.EventMapper;
import com.eventZen.event_module.repository.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepo;

    public List<EventResponseDTO> findAll() {
        return eventRepo.findAll().stream()
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventResponseDTO> findByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        // Fetch once, map once.
        List<Event> events = eventRepo.findByUserId(userId);
        return events.stream()
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    public EventResponseDTO findById(Long id) {
        return eventRepo.findById(id)
                .map(EventMapper::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + id));
    }

    @Transactional
    public EventResponseDTO create(EventDTO dto, Long userId) {
        Event event = EventMapper.toEntity(dto, userId);
        return EventMapper.toDTO(eventRepo.save(event));
    }

    @Transactional
    public EventResponseDTO update(Long id, EventDTO dto) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        EventMapper.updateEntity(event, dto);
        return EventMapper.toDTO(eventRepo.save(event));
    }

    public boolean isOwner(Long eventId, Object userIdObj) {
        if (userIdObj == null) return false;
        try {
            Long userId = Long.valueOf(userIdObj.toString());
            return eventRepo.findById(eventId)
                    .map(event -> event.getUserId().equals(userId))
                    .orElse(false);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @Transactional
    public void delete(Long id, Long userId, boolean isAdmin) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        // Final Auth Check: Admin or Owner
        if (isAdmin || (userId != null && event.getUserId().equals(userId))) {
            eventRepo.delete(event);
            System.out.println("Success: Event " + id + " deleted by " + (isAdmin ? "Admin" : "Owner"));
        } else {
            throw new AccessDeniedException("You are not authorized to delete this event");
        }
    }
}