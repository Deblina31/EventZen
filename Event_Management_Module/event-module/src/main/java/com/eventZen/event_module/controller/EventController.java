package com.eventZen.event_module.controller;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.eventZen.event_module.services.EventService;


@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class EventController {

    @Autowired
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<java.util.List<EventResponseDTO>> getAll() {
        return ResponseEntity.ok(eventService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    @GetMapping("/my-events")
    public ResponseEntity<java.util.List<EventResponseDTO>> getMyEvents(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(eventService.findByUserId(userId));
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<EventResponseDTO> create(@RequestBody EventDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(eventService.create(dto, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @eventService.isOwner(#id, #request.getAttribute('userId'))")
    public ResponseEntity<EventResponseDTO> update(@PathVariable Long id,
                                                   @RequestBody EventDTO dto,
                                                   HttpServletRequest request) {
        return ResponseEntity.ok(eventService.update(id, dto));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        eventService.delete(id, userId);

        return ResponseEntity.ok("Event deleted successfully");
    }
}