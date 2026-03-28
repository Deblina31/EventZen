package eventZen.example.eventZen.controllers;

import eventZen.example.eventZen.entity.User;
import eventZen.example.eventZen.repository.UserRepository;
import eventZen.example.eventZen.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    @Autowired
    private AuthService authService;
    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<User> usersPage = userRepository.findAll(PageRequest.of(page, size));
        return ResponseEntity.ok(usersPage);
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get detailed user info by ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}/activate")
    @Operation(summary = "Re-enable a deactivated user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> activateUser(@PathVariable Long id) {
        authService.activateUser(id);
        return ResponseEntity.ok(Map.of("message", "User reactivated successfully"));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Deactivate a user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
    }
    
}