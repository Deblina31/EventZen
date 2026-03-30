package eventZen.example.eventZen.controllers;

import eventZen.example.eventZen.dto.*;
import eventZen.example.eventZen.entity.User;
import eventZen.example.eventZen.repository.UserRepository;
import eventZen.example.eventZen.service.AuthService;
import eventZen.example.eventZen.utils.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import eventZen.example.eventZen.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register and login endpoints")
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponseDTO> register(
            @Valid @RequestBody RegisterDTO dto) {
        return ResponseEntity.ok(authService.register(dto));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT token")
    public ResponseEntity<AuthResponseDTO> login(
            @Valid @RequestBody LoginDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        String token  = request.getHeader("Authorization").substring(7);
        Long   userId = jwtUtils.getUserIdFromToken(token);
        User   user   = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "id",             user.getId(),
                "username",       user.getUsername(),
                "email",          user.getEmail(),
                "firstName",      user.getFirstName()    != null ? user.getFirstName()    : "",
                "lastName",       user.getLastName()     != null ? user.getLastName()     : "",
                "phoneNumber",    user.getPhoneNumber()  != null ? user.getPhoneNumber()  : "",
                "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : "",
                "role",           user.getRole().name()
        ));
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        try {
            String token  = request.getHeader("Authorization").substring(7);
            Long   userId = jwtUtils.getUserIdFromToken(token);
            User   user   = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (file.getSize() > 1024 * 1024)
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Image must be under 1MB"));

            String base64  = Base64.getEncoder().encodeToString(file.getBytes());
            String dataUrl = "data:" + file.getContentType() + ";base64," + base64;

            user.setProfilePicture(dataUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("profilePicture", dataUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Upload failed"));
        }
    }

}