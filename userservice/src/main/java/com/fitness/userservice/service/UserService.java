package com.fitness.userservice.service;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.model.User;
import com.fitness.userservice.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private UserRepository repository;
    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public UserResponse register( RegisterRequest request) {
        if(repository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email Already Exists");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstname());
        user.setLastName(request.getLastname());
       User savedUser= repository.save(user);
       UserResponse userResponse  = new UserResponse();
       userResponse.setId(savedUser.getId());
       userResponse.setPassword(savedUser.getPassword());
       userResponse.setEmail(savedUser.getEmail());
       userResponse.setFirstName(savedUser.getFirstName());
       userResponse.setLastName(savedUser.getLastName());
       userResponse.setCreatedAt(savedUser.getCreatedAt());
       userResponse.setUpdatedAt(savedUser.getUpdatedAt());
       return userResponse;
    }

    public UserResponse getUserProfile(String userId) {
        User user = repository.findById(userId)
                .orElseThrow(()->new RuntimeException("user not Found"));
        UserResponse userResponse  = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setPassword(user.getPassword());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setUpdatedAt(user.getUpdatedAt());
        return userResponse;
    }
}
