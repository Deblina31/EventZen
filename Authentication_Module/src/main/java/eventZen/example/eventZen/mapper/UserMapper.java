package eventZen.example.eventZen.mapper;

import eventZen.example.eventZen.dto.UserDTO;
import eventZen.example.eventZen.entity.Role;
import eventZen.example.eventZen.entity.User;

public class UserMapper {

    public static User toEntity(UserDTO dto){
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setRole(Role.valueOf(dto.getRole().toUpperCase()));

        return user;
    }

    public static UserDTO toDTO(User user){
        UserDTO dto = new UserDTO();
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());

        return dto;
    }
}