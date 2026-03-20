package eventZen.example.eventZen.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")
public class PublicController {

    // Info about the Auth service
    @GetMapping("/info")
    public ResponseEntity<?> serviceInfo() {
        return ResponseEntity.ok("Auth Service for EventZen. Handles registration, login, and user roles.");
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok("Auth Service is running");
    }

    // Check if email is available for registration
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        // In a real implementation, call AuthService to see if email exists
        boolean available = true; // placeholder
        return ResponseEntity.ok("Email " + email + " available: " + available);
    }

    // Public welcome or about page
    @GetMapping("/about")
    public ResponseEntity<?> about() {
        return ResponseEntity.ok("Welcome to EventZen Auth Service. Register or login to access Event Management.");
    }
}