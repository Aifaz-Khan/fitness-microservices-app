package com.fitness.aiservice.controller;

import com.fitness.aiservice.dto.GoalPlanRequest;
import com.fitness.aiservice.model.UserGoalPlan;
import com.fitness.aiservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendations/goal")
public class GoalPlanController {
    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<UserGoalPlan> getActiveGoalPlan(@RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(recommendationService.getActiveGoalPlan(userId));
    }

    @PostMapping
    public ResponseEntity<UserGoalPlan> generateGoalPlan(
            @RequestHeader("X-User-ID") String userId,
            @RequestBody GoalPlanRequest request) {
        return ResponseEntity.ok(recommendationService.generateGoalPlan(userId, request));
    }
}
