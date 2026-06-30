package com.fitness.activityservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${USER_SERVICE_URL:lb://USER-SERVICE}")
    private String userServiceUrl;

    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder(){
        return WebClient.builder();
    }

    @Bean
    public WebClient userServiceWebClient(WebClient.Builder loadBalancedWebClientBuilder){
        // If the URL contains "lb://", use the load-balanced builder.
        // Otherwise (e.g. direct HTTPS URL on Render), build a standard WebClient without load balancing.
        if (userServiceUrl.startsWith("lb://") || userServiceUrl.equals("http://USER-SERVICE")) {
            String url = userServiceUrl.equals("http://USER-SERVICE") ? "lb://USER-SERVICE" : userServiceUrl;
            return loadBalancedWebClientBuilder
                    .baseUrl(url)
                    .build();
        } else {
            return WebClient.builder()
                    .baseUrl(userServiceUrl)
                    .build();
        }
    }

}
