package eventZen.example.eventZen.service;

import eventZen.example.eventZen.dto.*;
import eventZen.example.eventZen.entity.*;
import eventZen.example.eventZen.repository.UserRepository;
import eventZen.example.eventZen.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthResponseDTO register(RegisterDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Role assignedRole;
        try {
            assignedRole = (dto.getRole() != null)
                    ? Role.valueOf(dto.getRole().toUpperCase())
                    : Role.USER;
        } catch (IllegalArgumentException e) {
            assignedRole = Role.USER;
        }

        User user = User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phoneNumber(dto.getPhoneNumber())
                .role(assignedRole)
                .isActive(true)
                .modifiedBy("SYSTEM")
                .build();

        userRepository.save(user);

        //String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        return new AuthResponseDTO(token, user.getRole().name(),
                user.getUsername(), user.getId());
    }

    public AuthResponseDTO login(LoginDTO dto) {
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!user.getIsActive()) {
            throw new RuntimeException("Account is disabled");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        //String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        return new AuthResponseDTO(token, user.getRole().name(),
                user.getUsername(), user.getId());

    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setIsActive(false);
        user.setModifiedBy("ADMIN");
        userRepository.save(user);
    }

    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(true);
        user.setModifiedBy("ADMIN");
        userRepository.save(user);
    }
}