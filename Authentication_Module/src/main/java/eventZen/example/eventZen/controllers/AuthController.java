package eventZen.example.eventZen.controllers;

import eventZen.example.eventZen.dto.LoginDTO;
import eventZen.example.eventZen.dto.UserDTO;
import eventZen.example.eventZen.entity.Role;
import eventZen.example.eventZen.entity.User;
import eventZen.example.eventZen.mapper.UserMapper;
import eventZen.example.eventZen.repository.UserRepository;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import eventZen.example.eventZen.utils.JwtUtils;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils; // ✅ Spring now injects the correct Bean
    }

    @PostMapping("/register")
// 1. CHANGE THIS TO <?>. If it says <UserDTO>, it will keep crashing!
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Encode password
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // Validate/Set Default Role
            if (user.getRole() == null) {
                user.setRole(Role.USER);
            }

            // Save user - Data is now in the DB
            User savedUser = userRepository.save(user);

            // 2. Use your UserMapper to create a safe DTO for the response
            UserDTO responseDTO = UserMapper.toDTO(savedUser);

            // 3. Generate the JWT Token
            String token = jwtUtils.generateToken(
                    savedUser.getUsername(),
                    savedUser.getRole().name(),
                    savedUser.getId()
            );

            // 4. Return a Map with both the User details and the Token
            // This is safe because the return type is ResponseEntity<?>
            System.out.println("--- DEBUG: REACHED THE RETURN BLOCK ---");
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
            // 1. Authenticate the credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
            );

            // 2. Fetch user from DB
            User user = userRepository.findByUsername(dto.getUsername());

            // 🔍 DEBUG: Check if ID exists right here
            if (user != null) {
                System.out.println("DEBUG: User found: " + user.getUsername());
                System.out.println("DEBUG: User ID from DB: " + user.getId()); // If this prints null, your Repo/Entity is the issue
            } else {
                System.out.println("DEBUG: User object is NULL");
            }

            // 3. Generate token
            // If user.getId() is null, JwtUtils will skip adding the claim
            String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());

            return ResponseEntity.ok(Map.of("token", token));

        } catch (Exception e) {
            e.printStackTrace(); // This will show the full error in your console
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: " + e.getMessage());
        }
    }

}
