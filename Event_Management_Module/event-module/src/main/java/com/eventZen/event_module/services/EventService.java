package com.eventZen.event_module.services;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.entity.Event;
import com.eventZen.event_module.entity.EventCategory;
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
        return eventRepo.findByIsActiveTrue()
                .stream().map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    public EventResponseDTO findById(Long id) {
        return eventRepo.findByIdAndIsActiveTrue(id)
                .map(EventMapper::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + id));
    }

    public List<EventResponseDTO> findByOrganizerId(Long organizerId) {
        if (organizerId == null) throw new IllegalArgumentException("Organizer ID cannot be null");
        return eventRepo.findByOrganizerIdAndIsActiveTrue(organizerId)
                .stream().map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventResponseDTO> findByCategory(EventCategory category) {
        return eventRepo.findByCategoryAndIsActiveTrue(category)
                .stream().map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EventResponseDTO create(EventDTO dto, Long organizerId) {
        Event event = EventMapper.toEntity(dto, organizerId);
        return EventMapper.toDTO(eventRepo.save(event));
    }

    @Transactional
    public EventResponseDTO update(Long id, EventDTO dto, Long requesterId, boolean isAdmin) {
        Event event = eventRepo.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        if (!isAdmin && !event.getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException("You can only update your own events");
        }

        EventMapper.updateEntity(event, dto);
        event.setModifiedBy(String.valueOf(requesterId));
        return EventMapper.toDTO(eventRepo.save(event));
    }

    @Transactional
    public void delete(Long id, Long requesterId, boolean isAdmin) {
        Event event = eventRepo.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        if (!isAdmin && !event.getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException("You can only delete your own events");
        }

       //Disable events
        event.setIsActive(false);
        event.setModifiedBy(String.valueOf(requesterId));
        eventRepo.save(event);
    }

    public boolean isOwner(Long eventId, Object userIdObj) {
        if (userIdObj == null) return false;
        try {
            Long userId = Long.valueOf(userIdObj.toString());
            return eventRepo.findByIdAndIsActiveTrue(eventId)
                    .map(e -> e.getOrganizerId().equals(userId))
                    .orElse(false);
        } catch (NumberFormatException e) {
            return false;
        }
    }
}