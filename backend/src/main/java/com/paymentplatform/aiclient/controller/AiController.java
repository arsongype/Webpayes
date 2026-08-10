package com.paymentplatform.aiclient.controller;

import com.paymentplatform.aiclient.ChatRequest;
import com.paymentplatform.aiclient.ChatResponse;
import com.paymentplatform.aiclient.ChatbotClient;
import com.paymentplatform.aiclient.FraudDetectionClient;
import com.paymentplatform.aiclient.FraudDetectionRequest;
import com.paymentplatform.aiclient.FraudDetectionResponse;
import com.paymentplatform.aiclient.KycClient;
import com.paymentplatform.aiclient.KycVerificationRequest;
import com.paymentplatform.aiclient.KycVerificationResponse;
import com.paymentplatform.aiclient.RecommendationClient;
import com.paymentplatform.aiclient.RecommendationRequest;
import com.paymentplatform.aiclient.RecommendationResponse;
import com.paymentplatform.aiclient.RiskScoringClient;
import com.paymentplatform.aiclient.RiskScoringRequest;
import com.paymentplatform.aiclient.RiskScoringResponse;
import com.paymentplatform.aiclient.RoutingClient;
import com.paymentplatform.aiclient.RoutingRequest;
import com.paymentplatform.aiclient.RoutingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final KycClient kycClient;
    private final ChatbotClient chatbotClient;
    private final RecommendationClient recommendationClient;
    private final RiskScoringClient riskScoringClient;
    private final FraudDetectionClient fraudDetectionClient;
    private final RoutingClient routingClient;

    @PostMapping("/kyc/verify")
    public ResponseEntity<KycVerificationResponse> verifyKyc(@RequestBody KycVerificationRequest request) {
        KycVerificationResponse response = kycClient.verify(request);
        if (response == null) {
            return ResponseEntity.status(503).build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/kyc/verification/{verificationId}")
    public ResponseEntity<KycVerificationResponse> getKycVerification(@PathVariable String verificationId) {
        KycVerificationResponse response = kycClient.getVerification(verificationId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chatbot/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = chatbotClient.chat(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recommendations/analyze")
    public ResponseEntity<RecommendationResponse> analyzeRecommendations(@RequestBody RecommendationRequest request) {
        RecommendationResponse response = recommendationClient.analyze(request);
        if (response == null) {
            return ResponseEntity.status(503).build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/risk/score")
    public ResponseEntity<RiskScoringResponse> scoreRisk(@RequestBody RiskScoringRequest request) {
        RiskScoringResponse response = riskScoringClient.score(request);
        if (response == null) {
            return ResponseEntity.status(503).build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/fraud/detect")
    public ResponseEntity<FraudDetectionResponse> detectFraud(@RequestBody FraudDetectionRequest request) {
        FraudDetectionResponse response = fraudDetectionClient.analyze(request);
        if (response == null) {
            return ResponseEntity.status(503).build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/routing/best-channel")
    public ResponseEntity<RoutingResponse> getBestChannel(@RequestBody RoutingRequest request) {
        RoutingResponse response = routingClient.getBestChannel(request);
        if (response == null) {
            return ResponseEntity.status(503).build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/fraud/alerts")
    public ResponseEntity<List<FraudDetectionResponse>> getFraudAlerts() {
        List<FraudDetectionResponse> alerts = fraudDetectionClient.getRecentAlerts();
        return ResponseEntity.ok(alerts != null ? alerts : List.of());
    }

    @GetMapping("/risk/score/{transactionId}")
    public ResponseEntity<RiskScoringResponse> getRiskScore(@PathVariable String transactionId) {
        RiskScoringResponse response = riskScoringClient.getScore(transactionId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze/{transactionId}")
    public ResponseEntity<Map<String, Object>> analyzeTransaction(@PathVariable String transactionId) {
        FraudDetectionResponse fraud = fraudDetectionClient.analyzeById(transactionId);
        RiskScoringResponse risk = riskScoringClient.getScore(transactionId);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("transactionId", transactionId);
        result.put("fraudScore", fraud != null ? fraud.getFraudScore() : 0.0);
        result.put("riskScore", risk != null ? risk.getRiskScore() : 0.0);
        result.put("status", "ANALYZED");
        return ResponseEntity.ok(result);
    }
}
