package com.fitness.aiservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "user_goal_plans")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserGoalPlan {
    @Id
    private String id;
    private String userId;
    private String goal;
    private Double currentWeight;
    private Double targetWeight;
    private String fitnessLevel;
    
    private String analysis;
    private List<Map<String, Object>> weeklyPlan;
    private List<Map<String, Object>> workoutSuggestions;
    private Map<String, Object> recoveryPlan;
    
    private LocalDateTime createdAt;
}
