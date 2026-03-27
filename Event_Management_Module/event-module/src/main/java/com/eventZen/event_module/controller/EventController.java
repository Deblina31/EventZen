package com.eventZen.event_module.controller;

import com.eventZen.event_module.dto.EventDTO;
import com.eventZen.event_module.dto.EventResponseDTO;
import com.eventZen.event_module.entity.EventCategory;
import com.eventZen.event_module.services.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Event management endpoints")
@SecurityRequirement(name = "BearerAuth")
public class EventController {

    private final EventService eventService;


    private Long extractUserId(HttpServletRequest request) {
        Object attr = request.getAttribute("userId");
        return attr != null ? Long.valueOf(attr.toString()) : null;
    }

    private boolean extractIsAdmin(HttpServletRequest request) {
        Object role = request.getAttribute("role");
        return "ADMIN".equals(role);
    }

    //GET all events
    @GetMapping
    @Operation(summary = "Get all active events")
    public ResponseEntity<List<EventResponseDTO>> getAll() {
        return ResponseEntity.ok(eventService.findAll());
    }

    //GET an event by id
    @GetMapping("/{id}")
    @Operation(summary = "Get event by ID")
    public ResponseEntity<EventResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    //GET only logged in vendor's events (admin sees all)
    @GetMapping("/my-events")
    @PreAuthorize("hasRole('VENDOR')")
    @Operation(summary = "Get events created by the logged in vendor")
    public ResponseEntity<List<EventResponseDTO>> getMyEvents(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(eventService.findByOrganizerId(userId));
    }

    //GET events by its category
    @GetMapping("/category/{category}")
    @Operation(summary = "Filter events by category")
    public ResponseEntity<List<EventResponseDTO>> getByCategory(
            @PathVariable EventCategory category) {
        return ResponseEntity.ok(eventService.findByCategory(category));
    }

    //POST /Create a new event (VENDOR and ADMIN only)
    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Create a new event")
    public ResponseEntity<EventResponseDTO> create(
            @Valid @RequestBody EventDTO dto,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(eventService.create(dto, userId));
    }

    //PUT/ Update an event (VENDOR or ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Update an event")
    public ResponseEntity<EventResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody EventDTO dto,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        boolean isAdmin = extractIsAdmin(request);
        return ResponseEntity.ok(eventService.update(id, dto, userId, isAdmin));
    }

    //DELETE/ disable an event (VENDOR or ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Disable an event")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        boolean isAdmin = extractIsAdmin(request);
        eventService.delete(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}