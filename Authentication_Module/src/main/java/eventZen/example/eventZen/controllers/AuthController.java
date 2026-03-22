package eventZen.example.eventZen.controllers;

import eventZen.example.eventZen.dto.LoginDTO;
import eventZen.example.eventZen.dto.UserDTO;
import eventZen.example.eventZen.entity.Role;
import eventZen.example.eventZen.entity.User;
import eventZen.example.eventZen.mapper.UserMapper;
import eventZen.example.eventZen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import eventZen.example.eventZen.utils.JwtUtils;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            if (user.getRole() == null) {
                user.setRole(Role.USER);
            }
            User savedUser = userRepository.save(user);
            UserDTO responseDTO = UserMapper.toDTO(savedUser);

            String token = jwtUtils.generateToken(
                    savedUser.getUsername(),
                    savedUser.getRole().name(),
                    savedUser.getId()
            );
            return ResponseEntity.ok(Map.of(
                    "user", responseDTO,
                    "token", token
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
            );
            User user = userRepository.findByUsername(dto.getUsername());

            String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());

            return ResponseEntity.ok(Map.of("token", token));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: " + e.getMessage());
        }
    }

}
