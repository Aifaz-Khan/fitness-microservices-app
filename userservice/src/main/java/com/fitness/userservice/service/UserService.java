package com.fitness.userservice.service;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.model.User;
import com.fitness.userservice.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public UserResponse register(RegisterRequest request) {

        log.info("Received KeycloakId: {}", request.getKeycloakId());

        if (repository.existsByEmail(request.getEmail())) {

            User existingUser = repository.findByEmail(request.getEmail());

            UserResponse userResponse = new UserResponse();
            userResponse.setId(existingUser.getId());
            userResponse.setKeycloakId(existingUser.getKeycloakId());
            userResponse.setPassword(existingUser.getPassword());
            userResponse.setEmail(existingUser.getEmail());
            userResponse.setFirstName(existingUser.getFirstName());
            userResponse.setLastName(existingUser.getLastName());
            userResponse.setHeight(existingUser.getHeight());
            userResponse.setWeight(existingUser.getWeight());
            userResponse.setAge(existingUser.getAge());
            userResponse.setGender(existingUser.getGender());
            userResponse.setCreatedAt(existingUser.getCreatedAt());
            userResponse.setUpdatedAt(existingUser.getUpdatedAt());

            return userResponse;
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        // Save Keycloak ID
        user.setKeycloakId(request.getKeycloakId());

        user.setFirstName(request.getFirstname());
        user.setLastName(request.getLastname());

        User savedUser = repository.save(user);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(savedUser.getId());
        userResponse.setKeycloakId(savedUser.getKeycloakId());
        userResponse.setPassword(savedUser.getPassword());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setFirstName(savedUser.getFirstName());
        userResponse.setLastName(savedUser.getLastName());
        userResponse.setHeight(savedUser.getHeight());
        userResponse.setWeight(savedUser.getWeight());
        userResponse.setAge(savedUser.getAge());
        userResponse.setGender(savedUser.getGender());
        userResponse.setCreatedAt(savedUser.getCreatedAt());
        userResponse.setUpdatedAt(savedUser.getUpdatedAt());

        return userResponse;
    }

    public UserResponse getUserProfile(String userId) {

        User user = repository.findByKeycloakId(userId)
                .orElseGet(() -> repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found")));

        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setKeycloakId(user.getKeycloakId());
        userResponse.setPassword(user.getPassword());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setHeight(user.getHeight());
        userResponse.setWeight(user.getWeight());
        userResponse.setAge(user.getAge());
        userResponse.setGender(user.getGender());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setUpdatedAt(user.getUpdatedAt());

        return userResponse;
    }

    public UserResponse updateProfile(String keycloakId, UserResponse request) {
        User user = repository.findByKeycloakId(keycloakId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setKeycloakId(keycloakId);
                    String email = request.getEmail();
                    if (email == null || email.trim().isEmpty()) {
                        email = keycloakId + "@placeholder.com";
                    }
                    newUser.setEmail(email);
                    newUser.setFirstName(request.getFirstName() != null ? request.getFirstName() : "Athlete");
                    newUser.setLastName(request.getLastName() != null ? request.getLastName() : "");
                    newUser.setPassword("keycloak_managed");
                    return newUser;
                });

        user.setHeight(request.getHeight());
        user.setWeight(request.getWeight());
        user.setAge(request.getAge());
        user.setGender(request.getGender());

        User savedUser = repository.save(user);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(savedUser.getId());
        userResponse.setKeycloakId(savedUser.getKeycloakId());
        userResponse.setPassword(savedUser.getPassword());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setFirstName(savedUser.getFirstName());
        userResponse.setLastName(savedUser.getLastName());
        userResponse.setHeight(savedUser.getHeight());
        userResponse.setWeight(savedUser.getWeight());
        userResponse.setAge(savedUser.getAge());
        userResponse.setGender(savedUser.getGender());
        userResponse.setCreatedAt(savedUser.getCreatedAt());
        userResponse.setUpdatedAt(savedUser.getUpdatedAt());

        return userResponse;
    }

    public Boolean existByUserId(String userId) {

        log.info("Calling User Validation API for userId: {}", userId);

        return repository.existsByKeycloakId(userId);
    }
}