package com.fitness.aiservice.repository;

import com.fitness.aiservice.model.UserGoalPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserGoalPlanRepository extends MongoRepository<UserGoalPlan, String> {
    Optional<UserGoalPlan> findFirstByUserIdOrderByCreatedAtDesc(String userId);
}
