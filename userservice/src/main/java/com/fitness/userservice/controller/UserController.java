package com.fitness.userservice.controller;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("api/users")
public class UserController {
    private UserService userService;
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId){
        try {
            return ResponseEntity.ok(userService.getUserProfile(userId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "Unknown Error",
                "type", e.getClass().getName()
            ));
        }
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request){
        try {
            return ResponseEntity.ok(userService.register(request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "Unknown Error",
                "type", e.getClass().getName()
            ));
        }
    }
    @GetMapping("/{userId}/validate")
    public ResponseEntity<Boolean>validate(@PathVariable String userId){
        return ResponseEntity.ok(userService.existByUserId(userId));
    }
    @PutMapping("/{keycloakId}")
    public ResponseEntity<?> updateProfile(@PathVariable String keycloakId, @RequestBody UserResponse request){
        try {
            return ResponseEntity.ok(userService.updateProfile(keycloakId, request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "Unknown Error",
                "type", e.getClass().getName()
            ));
        }
    }
}
