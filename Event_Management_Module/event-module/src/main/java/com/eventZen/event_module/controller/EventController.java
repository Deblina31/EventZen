package com.eventZen.event_module.controller;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.eventZen.event_module.services.EventService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/events")
public class EventController {

    @Autowired
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<java.util.List<EventResponseDTO>> getAll() {
        return ResponseEntity.ok(eventService.findAll());
    }

    // ✅ GET ONE: Returns a single event by ID
    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    @GetMapping("/my-events")
    public ResponseEntity<java.util.List<EventResponseDTO>> getMyEvents(HttpServletRequest request) {
        // This attribute was set by your JwtFilter
        Long userId = (Long) request.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(eventService.findByUserId(userId));
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<EventResponseDTO> create(@RequestBody EventDTO dto, HttpServletRequest request) {
        // Get the ID that your JwtFilter set
        Long userId = (Long) request.getAttribute("userId");

        // Call service, not repository!
        return ResponseEntity.ok(eventService.create(dto, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @eventService.isOwner(#id, #request.getAttribute('userId'))")
    public ResponseEntity<EventResponseDTO> update(@PathVariable Long id,
                                                   @RequestBody EventDTO dto,
                                                   HttpServletRequest request) {
        // We pass the work to the service
        return ResponseEntity.ok(eventService.update(id, dto));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id, HttpServletRequest request) {
        // 1. Get the userId from the request attributes (set by your JwtFilter)
        Long userId = (Long) request.getAttribute("userId");

        // 2. Call the service to handle the deletion logic
        // The service should check if the user is an Admin or the Owner
        eventService.delete(id, userId);

        return ResponseEntity.ok("Event deleted successfully");
    }
}