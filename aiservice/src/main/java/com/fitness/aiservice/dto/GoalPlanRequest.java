package com.fitness.aiservice.dto;

import lombok.Data;

@Data
public class GoalPlanRequest {
    private String goal; // "LOSE_WEIGHT", "BUILD_MUSCLE", "IMPROVE_ENDURANCE", "MARATHON_TRAINING"
    private Double currentWeight;
    private Double targetWeight;
    private String fitnessLevel; // "BEGINNER", "INTERMEDIATE", "ADVANCED"
}
