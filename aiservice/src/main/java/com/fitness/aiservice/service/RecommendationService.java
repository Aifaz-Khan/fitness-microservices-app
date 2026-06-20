package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.model.ChatMessage;
import com.fitness.aiservice.repository.RecommendationRepository;
import com.fitness.aiservice.repository.ChatMessageRepository;
import com.fitness.aiservice.dto.ChatRequest;
import com.fitness.aiservice.dto.ChatResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiService geminiService;

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
}
