package eventZen.example.eventZen.service;

import eventZen.example.eventZen.dto.UserDTO;
import eventZen.example.eventZen.entity.User;
import eventZen.example.eventZen.mapper.UserMapper;
import eventZen.example.eventZen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(UserDTO dto){

        User user = UserMapper.toEntity(dto);

        return userRepository.save(user);
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public UserDTO login(String email, String password){

        User user = userRepository.findByEmail(email);

        if(user == null){
            throw new RuntimeException("User not found");
        }

        if(!user.getPassword().equals(password)){
            throw new RuntimeException("Invalid password");
        }

        return UserMapper.toDTO(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}