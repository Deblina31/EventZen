package eventZen.example.eventZen.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")
public class PublicController {

    @GetMapping("/info")
    public ResponseEntity<?> serviceInfo() {
        return ResponseEntity.ok("Auth Service for EventZen.");
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok("Health is ok");
    }

    @GetMapping("/about")
    public ResponseEntity<?> about() {
        return ResponseEntity.ok("Event Management Platform");
    }
}