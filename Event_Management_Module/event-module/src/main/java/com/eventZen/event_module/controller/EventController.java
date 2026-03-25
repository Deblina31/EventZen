package com.eventZen.event_module.controller;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.services.EventService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAll() {
        return ResponseEntity.ok(eventService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<EventResponseDTO>> getMyEvents(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = Long.valueOf(userIdAttr.toString());
        return ResponseEntity.ok(eventService.findByUserId(userId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<EventResponseDTO> create(@RequestBody EventDTO dto, HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");
        Long userId = (userIdAttr != null) ? Long.valueOf(userIdAttr.toString()) : null;
        return ResponseEntity.ok(eventService.create(dto, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @eventService.isOwner(#id, #request.getAttribute('userId'))")
    public ResponseEntity<EventResponseDTO> update(@PathVariable Long id, @RequestBody EventDTO dto) {
        return ResponseEntity.ok(eventService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, HttpServletRequest request) {
        try {
            Object userIdAttr = request.getAttribute("userId");
            if (userIdAttr == null) {
                return ResponseEntity.status(401).body("{\"error\": \"User ID missing\"}");
            }

            Long userId = Long.valueOf(userIdAttr.toString());
            boolean isAdmin = request.isUserInRole("ROLE_ADMIN") || request.isUserInRole("ADMIN");

            eventService.delete(id, userId, isAdmin);
            return ResponseEntity.ok().body("{\"message\": \"Deleted successfully\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}