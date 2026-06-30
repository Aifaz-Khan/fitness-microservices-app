package com.fitness.activityservice.controller;
import java.util.List;
import com.fitness.activityservice.dto.ActivityRequest;
import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.service.ActivityService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@AllArgsConstructor

public class ActivityController {
    private ActivityService activityService;
    @PostMapping
    public ResponseEntity<?> trackActivity(@RequestBody ActivityRequest request){
        try {
            return ResponseEntity.ok(activityService.trackActivity(request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "Unknown Error",
                "type", e.getClass().getName()
            ));
        }
    }
    @GetMapping
    public ResponseEntity<?> getUserActivities(@RequestHeader("X-User-ID")String userId){
        try {
            return ResponseEntity.ok(activityService.getUserActivities(userId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "Unknown Error",
                "type", e.getClass().getName()
            ));
        }
    }
    @GetMapping("/{activityId}")
    public ResponseEntity<?> getActivity(@PathVariable String activityId){
        try {
            return ResponseEntity.ok(activityService.getActivityById(activityId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "Unknown Error",
                "type", e.getClass().getName()
            ));
        }
    }
}
