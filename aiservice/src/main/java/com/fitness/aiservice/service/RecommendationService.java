package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.model.ChatMessage;
import com.fitness.aiservice.repository.RecommendationRepository;
import com.fitness.aiservice.repository.ChatMessageRepository;
import com.fitness.aiservice.dto.ChatRequest;
import com.fitness.aiservice.dto.ChatResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.model.UserGoalPlan;
import com.fitness.aiservice.repository.UserGoalPlanRepository;
import com.fitness.aiservice.dto.GoalPlanRequest;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.ParameterizedTypeReference;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserGoalPlanRepository userGoalPlanRepository;
    private final GeminiService geminiService;
    private final WebClient.Builder webClientBuilder;

    @Value("${ACTIVITY_SERVICE_URL:http://localhost:8082}")
    private String activityServiceUrl;

    @Value("${USER_SERVICE_URL:http://localhost:8081}")
    private String userServiceUrl;

    public List<Recommendation> getUserRecommendation(String userId) {
        return recommendationRepository.findByUserId(userId);
    }

    public Recommendation getActivityRecommendation(String activityId) {
        return recommendationRepository.findByActivityId(activityId)
                .orElseThrow(()-> new RuntimeException(("no Recommendation found for these activity: "+ activityId)));
    }

    public List<ChatMessage> getChatHistory(String userId) {
        return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    public ChatResponse getChatReply(String userId, ChatRequest request) {
        try {
            // 1. Save user message to database
            ChatMessage userMsg = ChatMessage.builder()
                    .userId(userId)
                    .role("user")
                    .text(request.getMessage())
                    .createdAt(LocalDateTime.now())
                    .build();
            chatMessageRepository.save(userMsg);

            // 2. Fetch full conversation history from database
            List<ChatMessage> history = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);

            // 3. Compile prompt
            StringBuilder prompt = new StringBuilder();
            prompt.append("System: You are an expert AI Fitness Coach. Answer the user's fitness, health, nutrition, or workout questions. Keep answers clear, professional, motivating, and safe.\n\n");
            
            for (ChatMessage msg : history) {
                String roleName = "model".equalsIgnoreCase(msg.getRole()) ? "Coach" : "User";
                prompt.append(roleName).append(": ").append(msg.getText()).append("\n");
            }
            
            prompt.append("Coach: ");

            // 4. Request answer from Gemini
            String aiResponse = geminiService.getAnswer(prompt.toString());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(aiResponse);
            JsonNode textNode = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");
            
            String reply = textNode.asText();

            // 5. Save coach response to database
            ChatMessage modelMsg = ChatMessage.builder()
                    .userId(userId)
                    .role("model")
                    .text(reply)
                    .createdAt(LocalDateTime.now())
                    .build();
            chatMessageRepository.save(modelMsg);

            return new ChatResponse(reply);
        } catch (Exception e) {
            e.printStackTrace();
            return new ChatResponse("Sorry, I'm having trouble processing that right now. Let's try again in a moment!");
        }
    }

    public UserGoalPlan getActiveGoalPlan(String userId) {
        return userGoalPlanRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);
    }

    public UserGoalPlan generateGoalPlan(String userId, GoalPlanRequest request) {
        try {
            // 1. Fetch user activities from activityservice via WebClient
            WebClient webClient = webClientBuilder.build();
            List<Map<String, Object>> activities = webClient.get()
                    .uri(activityServiceUrl + "/api/activities")
                    .header("X-User-ID", userId)
                    .retrieve()
                    .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .collectList()
                    .block();

            // Fetch user profile from userservice
            Map<String, Object> userProfile = null;
            try {
                userProfile = webClient.get()
                        .uri(userServiceUrl + "/api/users/" + userId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                        .block();
            } catch (Exception e) {
                System.out.println("Failed to fetch user profile: " + e.getMessage());
            }

            // 2. Compile prompt
            String prompt = createGoalPlanPrompt(request, activities, userProfile);

            // 3. Request answer from Gemini
            String aiResponse = geminiService.getAnswer(prompt);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(aiResponse);
            JsonNode textNode = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");
            
            String jsonContent = textNode.asText()
                    .replaceAll("```json\\n", "")
                    .replaceAll("\\n```", "")
                    .trim();

            JsonNode planJson = mapper.readTree(jsonContent);

            String analysis = planJson.path("analysis").asText();
            List<Map<String, Object>> weeklyPlan = mapper.convertValue(planJson.path("weeklyPlan"), new TypeReference<List<Map<String, Object>>>() {});
            List<Map<String, Object>> workoutSuggestions = mapper.convertValue(planJson.path("workoutSuggestions"), new TypeReference<List<Map<String, Object>>>() {});
            Map<String, Object> recoveryPlan = mapper.convertValue(planJson.path("recoveryPlan"), new TypeReference<Map<String, Object>>() {});

            // 4. Save and return plan
            UserGoalPlan plan = UserGoalPlan.builder()
                    .userId(userId)
                    .goal(request.getGoal())
                    .currentWeight(request.getCurrentWeight())
                    .targetWeight(request.getTargetWeight())
                    .fitnessLevel(request.getFitnessLevel())
                    .analysis(analysis)
                    .weeklyPlan(weeklyPlan)
                    .workoutSuggestions(workoutSuggestions)
                    .recoveryPlan(recoveryPlan)
                    .createdAt(LocalDateTime.now())
                    .build();

            return userGoalPlanRepository.save(plan);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate AI fitness plan: " + e.getMessage());
        }
    }

    private String createGoalPlanPrompt(GoalPlanRequest request, List<Map<String, Object>> activities, Map<String, Object> userProfile) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Analyze this user's fitness request and compile a tailored fitness program in the EXACT JSON format below.\n\n");
        
        prompt.append("{\n");
        prompt.append("  \"analysis\": \"Detailed executive progress analysis based on history. If no history, give a motivating onboarding analysis.\",\n");
        prompt.append("  \"weeklyPlan\": [\n");
        prompt.append("    { \"day\": \"Monday\", \"workout\": \"Workout description\", \"intensity\": \"Low/Medium/High\", \"type\": \"CARDIO/STRENGTH/RECOVERY\" },\n");
        prompt.append("    ...\n");
        prompt.append("  ],\n");
        prompt.append("  \"workoutSuggestions\": [\n");
        prompt.append("    { \"name\": \"Exercise Name\", \"sets\": \"Sets/Reps details\", \"coachingTip\": \"Proper execution tip\" }\n");
        prompt.append("  ],\n");
        prompt.append("  \"recoveryPlan\": {\n");
        prompt.append("    \"restDays\": \"Days for rest (e.g. Wednesday, Sunday)\",\n");
        prompt.append("    \"stretches\": [\"Stretch 1\", \"Stretch 2\"],\n");
        prompt.append("    \"sleepTargetHours\": 8,\n");
        prompt.append("    \"hydrationLiters\": 3.0\n");
        prompt.append("  }\n");
        prompt.append("}\n\n");

        prompt.append("User Request Details:\n");
        prompt.append("- Goal: ").append(request.getGoal()).append("\n");
        prompt.append("- Current Weight: ").append(request.getCurrentWeight()).append(" kg\n");
        prompt.append("- Target Weight: ").append(request.getTargetWeight()).append(" kg\n");
        prompt.append("- Fitness Level: ").append(request.getFitnessLevel()).append("\n\n");

        prompt.append("User Profile Demographics:\n");
        if (userProfile != null) {
            prompt.append("- Age: ").append(userProfile.get("age")).append("\n");
            prompt.append("- Gender: ").append(userProfile.get("gender")).append("\n");
            prompt.append("- Height: ").append(userProfile.get("height")).append(" cm\n");
            prompt.append("- Base Weight: ").append(userProfile.get("weight")).append(" kg\n\n");
        } else {
            prompt.append("- No profile demographics found.\n\n");
        }

        prompt.append("User Activity History (Last workouts logged):\n");
        if (activities == null || activities.isEmpty()) {
            prompt.append("- No previous workouts logged yet. This is a fresh starting plan.\n");
        } else {
            for (Map<String, Object> act : activities) {
                prompt.append(String.format("- Type: %s, Duration: %s min, Calories: %s kcal, Start: %s, Metrics: %s\n",
                        act.get("type"), act.get("duration"), act.get("caloriesBurned"), act.get("startTime"), act.get("additionalMetrics")));
            }
        }
        
        prompt.append("\nIMPORTANT:\n");
        prompt.append("- Return ONLY valid JSON.\n");
        prompt.append("- Do not include markdown blocks like ```json.\n");
        prompt.append("- Do not include explanations outside the JSON.\n");
        prompt.append("- Follow the exact structure shown above.\n");
        prompt.append("- If some historical workouts do not have heart rates, analyze their intensity via the 'rpe' score (scale 1-10) inside 'additionalMetrics'.\n");

        return prompt.toString();
    }
}
