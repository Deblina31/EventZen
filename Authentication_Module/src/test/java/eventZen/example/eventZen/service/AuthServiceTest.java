package eventZen.example.eventZen.service;

import eventZen.example.eventZen.dto.LoginDTO;
import eventZen.example.eventZen.dto.RegisterDTO;
import eventZen.example.eventZen.entity.Role;
import eventZen.example.eventZen.entity.User;
import eventZen.example.eventZen.repository.UserRepository;
import eventZen.example.eventZen.utils.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtils jwtUtils;

    @InjectMocks private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("$2a$encoded")
                .role(Role.USER)
                .isActive(true)
                .build();
    }

    //register
    @Test
    @DisplayName("creates user and returns token")
    void register_createsUserAndReturnsToken() {
        RegisterDTO dto = new RegisterDTO();
        dto.setUsername("newuser");
        dto.setEmail("new@example.com");
        dto.setPassword("password123");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("$encoded");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtUtils.generateToken(any(), any(), any())).thenReturn("mock.jwt.token");

        var result = authService.register(dto);

        assertThat(result.getToken()).isEqualTo("mock.jwt.token");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("throws error when username already taken")
    void register_throwsWhenUsernameTaken() {
        RegisterDTO dto = new RegisterDTO();
        dto.setUsername("testuser");
        dto.setEmail("other@example.com");
        dto.setPassword("pass1234");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username");
    }

    @Test
    @DisplayName("throws error when email already registered")
    void register_throwsWhenEmailTaken() {
        RegisterDTO dto = new RegisterDTO();
        dto.setUsername("uniqueuser");
        dto.setEmail("test@example.com");
        dto.setPassword("pass1234");

        when(userRepository.existsByUsername("uniqueuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email");
    }

    //login
    @Test
    @DisplayName("returns jwt token for valid credentials")
    void login_returnsTokenForValidCredentials() {
        LoginDTO dto = new LoginDTO();
        dto.setUsername("testuser");
        dto.setPassword("plainpassword");

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("plainpassword", "$2a$encoded"))
                .thenReturn(true);
        when(jwtUtils.generateToken(any(), any(), any()))
                .thenReturn("valid.jwt.token");

        var result = authService.login(dto);

        assertThat(result.getToken()).isEqualTo("valid.jwt.token");
        assertThat(result.getRole()).isEqualTo("USER");
    }

    @Test
    @DisplayName("throws for wrong password")
    void login_throwsForWrongPassword() {
        LoginDTO dto = new LoginDTO();
        dto.setUsername("testuser");
        dto.setPassword("wrongpassword");

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", "$2a$encoded"))
                .thenReturn(false);

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid");
    }

    @Test
    @DisplayName("throws for non-existent user")
    void login_throwsForNonExistentUser() {
        LoginDTO dto = new LoginDTO();
        dto.setUsername("nobody");
        dto.setPassword("pass");

        when(userRepository.findByUsername("nobody"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("throws error for deactivated account")
    void login_throwsForDeactivatedAccount() {
        sampleUser.setIsActive(false);
        LoginDTO dto = new LoginDTO();
        dto.setUsername("testuser");
        dto.setPassword("plainpassword");

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(sampleUser));

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("disabled");
    }
}