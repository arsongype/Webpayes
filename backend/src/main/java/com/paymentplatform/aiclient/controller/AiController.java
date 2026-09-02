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
import com.paymentplatform.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
    private final CurrentUserService currentUserService;

    private static final Map<Pattern, String> KNOWLEDGE_BASE = new LinkedHashMap<>();

    static {
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(bonjour|salut|bonsoir|hello|hi|hey|bonjours).*"), "Bonjour ! Comment puis-je vous aider aujourd'hui ?");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(que peux-tu|que sais-tu|aide|help|fonctionnalités|que fais-tu|qu'est-ce que tu peux|qu'est-ce que tu sais).*"), "Je peux discuter de presque tout avec vous : questions générales, concepts, aide sur l'application, explications, conseils, etc. Posez-moi n'importe quelle question.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(transfert|envoyer de l'argent|virement|déroulement transaction|comment fonctionne une transaction|étapes transaction|comment se passe un transfert).*"), "Pour effectuer un transfert : allez dans Transfert, choisissez le bénéficiaire ou le numéro, le montant et le motif, puis validez. Vous pouvez aussi utiliser un QR Code ou un canal automatique recommandé par l’assistant. La transaction est enregistrée et les deux portefeuilles sont mis à jour.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(wallet|portefeuille|solde|crédit|débit).*"), "Votre portefeuille affiche votre solde, vos transactions et vos moyens de paiement. Vous pouvez y ajouter une carte bancaire, un compte Mobile Money ou un compte bancaire, et définir un moyen favori pour les paiements rapides.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(paiement|moyen de paiement|carte|mobile money|virement bancaire).*"), "Vous pouvez enregistrer plusieurs moyens de paiement : carte bancaire, Mobile Money ou virement bancaire. Allez dans Paiements pour les gérer. Le type et le fournisseur déterminent le canal utilisé pour les transactions.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(kyc|vérification d'identité|pièce d'identité|identité).*"), "La vérification KYC permet de valider votre identité. Rendez-vous dans Assistant IA > Vérification d’identité, remplissez le formulaire et téléchargez votre pièce d’identité. Un score de confiance et un statut (validé / rejeté) vous seront retournés.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(facture|facturation|billing|payer une facture|générer facture).*"), "Dans Facturation, vous pouvez créer et gérer des factures, suivre les statuts et relancer les impayés. C’est également dans ce module que vous pouvez consulter l’historique de facturation.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(remboursement|rembourser|refund).*"), "Les remboursements se gèrent dans le module Remboursements. Vous pouvez y suivre les demandes, accepter ou refuser un remboursement selon les règles applicables à la transaction concernée.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(litige|dispute|conflit|problème de transaction).*"), "En cas de litige, utilisez le module Litiges pour ouvrir un dossier, fournir des justificatifs et suivre la résolution. L’équipe support ou l’administrateur peut également intervenir sur votre dossier.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(qr code|qr|scan|scanner).*"), "Le module QR Code vous permet de générer un QR de paiement ou de scan pour accélérer un transfert. Utilisez-le depuis le menu QR Code ou lors d’un paiement marchand.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(marchand|devenir marchand|boutique|commerce).*"), "Pour devenir marchand, allez dans Devenir marchand et soumettez votre demande. Une fois approuvé, vous pourrez gérer votre profil, vos produits et vos commandes depuis les sections dédiées.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(alerte fraude|fraude|bloquer|risque).*"), "Les alertes fraude apparaissent dans Alertes fraude. Vous pouvez consulter le score de risque d’une transaction, analyser une transaction, et un administrateur peut marquer une alerte comme traitée ou bloquer la transaction.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(notifications|notification|alerte|message).*"), "Les notifications centralisent vos alertes, rappels et confirmations. Un indicateur apparaît dans la barre supérieure quand vous avez des notifications non lues. Vous pouvez toutes les marquer comme lues.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(profil|profil utilisateur|avatar|photo|mot de passe|compte).*"), "Dans Profil, vous pouvez modifier vos informations personnelles, changer votre mot de passe, gérer votre avatar et consulter vos préférences de compte.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(assistant|ia|chatbot|intelligence artificielle|aide).*"), "L’Assistant IA peut répondre à vos questions sur l’application, analyser vos transactions, vérifier votre identité KYC, recommander le meilleur canal de paiement, détecter des fraudes et évaluer le risque d’une transaction.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(admin|administration|droits|rôle admin|espace admin).*"), "L’espace Admin permet de gérer les utilisateurs, les marchands, les demandes d’affiliation, les litiges, les remboursements et les alertes fraude. Seuls les comptes avec le rôle ADMIN y ont accès.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(merci|thank|thanks|thx|remercie).*"), "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(bonsoir|soir).*"), "Bonsoir ! Comment puis-je vous aider ?");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(bonne journée|bonne soirée|au revoir|bye|a bientôt).*"), "Merci et à bientôt ! N'hésitez pas à revenir si vous avez besoin d'aide.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(comment ça va|ça va|tu vas bien|vous allez bien).*"), "Je suis un assistant virtuel, je fonctionne toujours au top ! Et vous, comment puis-je vous aider ?");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(qui es-tu|que es-tu|tu es qui|ton nom).*"), "Je suis l'assistant IA de cette plateforme de paiement. Je peux répondre à vos questions sur l'application, vous guider dans les fonctionnalités et discuter avec vous de sujets généraux.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(probleme|bug|erreur|marche pas|ne fonctionne pas|impossible).*"), "Je suis désolé d'apprendre que vous rencontrez un problème. Pouvez-vous me décrire ce qui ne fonctionne pas ? Je vais essayer de vous aider à résoudre cela.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(contact|support|aide|assistance|service client).*"), "Pour toute assistance, vous pouvez utiliser ce chat, consulter la documentation ou contacter le support technique via la page Support.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(faim|manger|nourriture|affamé|aide alimentaire|repas).*"), "Si vous ou une personne que vous connaissez avez faim, voici quelques pistes : contactez une association locale d'aide alimentaire, une banque alimentaire, ou les services sociaux de votre ville. En cas d'urgence, appelez les services d'aide d'urgence.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(argent|prêt|emprunt|crédit|budget|dette|dettes).*"), "Pour les questions d'argent, établissez un budget, comparez les offres avant de vous engager, et si vous avez des difficultés, contactez un conseiller budgétaire ou une association d'aide aux particuliers.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(santé|malade|médecin|hôpital|douleur|fièvre|symptôme).*"), "Pour toute question de santé, je vous recommande de consulter un professionnel de santé. Si c'est urgent, contactez les urgences. Je peux vous donner des conseils généraux, mais je ne remplace pas un avis médical.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(triste|déprimé|anxieux|stress|malheureux|solitude|seul).*"), "Je suis désolé d'apprendre que vous vous sentez mal. Si vous avez besoin d'aide, n'hésitez pas à en parler à un proche ou à contacter un professionnel de santé mentale. Vous n'êtes pas seul.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(travail|emploi|chômage|cherche|cv|entretien|job).*"), "Pour la recherche d'emploi, préparez un CV clair, ciblez les offres correspondant à votre profil, et pratiquez vos entretiens. Si vous êtes au chômage, renseignez-vous sur les aides disponibles.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(logement|loyer|maison|appartement|sans abri|toit).*"), "Pour les questions de logement, renseignez-vous auprès des services sociaux ou des associations d'aide au logement. Si vous êtes en situation de précarité, des structures peuvent vous accompagner.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(transport|voiture|bus|train|avion|trajet).*"), "Pour les transports, planifiez vos trajets à l'avance, comparez les moyens et vérifiez les horaires. Si vous avez besoin d'aide pour un trajet spécifique, donnez-moi plus de détails.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(étude|école|université|examen|formation|apprendre).*"), "Pour les études, organisez votre temps, utilisez des méthodes de révision efficaces, et n'hésitez pas à demander de l'aide. Si vous cherchez une formation, renseignez-vous sur les diplômes et les débouchés.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(conseil|conseils|astuce|astuces|comment faire|comment puis).*"), "Je peux vous donner des conseils généraux selon votre situation. Précisez-moi votre besoin et je ferai de mon mieux pour vous aider avec des recommandations pratiques.");
        KNOWLEDGE_BASE.put(Pattern.compile("(?i).*(information|info|expliquer|explique|qu'est-ce que|qu'est ce que|c'est quoi|définition).*"), "Je peux vous expliquer des concepts, vous donner des informations générales ou vous aider à comprendre un sujet. Posez-moi votre question et je vais vous répondre clairement.");
    }

    @PostMapping("/kyc/verify")
    public ResponseEntity<KycVerificationResponse> verifyKyc(@RequestBody KycVerificationRequest request) {
        KycVerificationRequest resolved = resolveUserId(request);
        KycVerificationResponse response = kycClient.verify(resolved);
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
        String message = request.getMessage() == null ? "" : request.getMessage().trim();
        String lowerMessage = message.toLowerCase();

        String appReply = findAppReply(lowerMessage);
        if (appReply != null) {
            return ResponseEntity.ok(ChatResponse.builder()
                    .session_id(request.getSession_id())
                    .reply(appReply)
                    .build());
        }

        try {
            ChatResponse externalReply = chatbotClient.chat(request);
            if (externalReply != null && externalReply.getReply() != null && !externalReply.getReply().isBlank()
                    && !isExternalUnavailableMessage(externalReply.getReply())) {
                return ResponseEntity.ok(externalReply);
            }
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(ChatResponse.builder()
                .session_id(request.getSession_id())
                .reply(generateFallbackReply(message))
                .build());
    }

    private boolean isExternalUnavailableMessage(String reply) {
        String lower = reply.toLowerCase();
        return lower.contains("indisponible") || lower.contains("unavailable") || lower.contains("erreur de connexion");
    }

    private String findAppReply(String lowerMessage) {
        for (Map.Entry<Pattern, String> entry : KNOWLEDGE_BASE.entrySet()) {
            Matcher matcher = entry.getKey().matcher(lowerMessage);
            if (matcher.find()) {
                return entry.getValue();
            }
        }
        return null;
    }

    private String generateFallbackReply(String message) {
        String lower = message.toLowerCase();

        if (lower.contains("qui es-tu") || lower.contains("tu es qui") || lower.contains("ton nom")) {
            return "Je suis l'assistant IA de cette plateforme. Je peux répondre à vos questions sur l'application, vous guider dans les fonctionnalités et discuter avec vous de sujets généraux.";
        }
        if (lower.contains("merci") || lower.contains("thank")) {
            return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.";
        }
        if (lower.contains("bonne journée") || lower.contains("bonne soirée") || lower.contains("au revoir") || lower.contains("bye")) {
            return "Merci et à bientôt ! N'hésitez pas à revenir si vous avez besoin d'aide.";
        }
        if (lower.contains("comment ça va") || lower.contains("ça va") || lower.contains("tu vas bien")) {
            return "Je suis un assistant virtuel, je fonctionne toujours au top ! Et vous, comment puis-je vous aider ?";
        }
        if (lower.contains("problème") || lower.contains("bug") || lower.contains("erreur") || lower.contains("marche pas")) {
            return "Je suis désolé d'apprendre que vous rencontrez un problème. Pouvez-vous me décrire ce qui ne fonctionne pas ? Je vais essayer de vous aider à résoudre cela.";
        }
        if (lower.contains("contact") || lower.contains("support") || lower.contains("service client")) {
            return "Pour toute assistance, vous pouvez utiliser ce chat, consulter la documentation ou contacter le support technique via la page Support.";
        }
        if (lower.length() < 3) {
            return "Pouvez-vous préciser votre question ? Je suis là pour vous aider.";
        }

        if (lower.contains("faim") || lower.contains("manger") || lower.contains("nourriture") || lower.contains("affamé") || lower.contains("aide alimentaire")) {
            return "Si vous ou une personne que vous connaissez avez faim, voici quelques pistes utiles : contactez une association locale d'aide alimentaire, une banque alimentaire, ou les services sociaux de votre ville. En cas d'urgence, appelez les services d'aide d'urgence. Si vous voulez, je peux aussi vous aider à trouver des contacts ou des ressources selon votre région.";
        }
        if (lower.contains("argent") || lower.contains("prêt") || lower.contains("emprunt") || lower.contains("crédit") || lower.contains("budget")) {
            return "Pour les questions d'argent, il est important de bien planifier : établissez un budget, évitez les dettes inutiles, et si vous avez besoin d'un prêt, comparez les offres et lisez bien les conditions. Si vous avez des difficultés financières, pensez à contacter un conseiller budgétaire ou une association d'aide aux particuliers.";
        }
        if (lower.contains("santé") || lower.contains("malade") || lower.contains("médecin") || lower.contains("hôpital") || lower.contains("douleur")) {
            return "Pour toute question de santé, je vous recommande de consulter un professionnel de santé. Si vous avez un problème urgent, contactez les urgences. Je peux vous donner des conseils généraux, mais je ne remplace pas un avis médical.";
        }
        if (lower.contains("triste") || lower.contains("déprimé") || lower.contains("anxieux") || lower.contains("stress") || lower.contains("malheureux") || lower.contains("solitude")) {
            return "Je suis désolé d'apprendre que vous vous sentez mal. Si vous avez besoin d'aide, n'hésitez pas à en parler à un proche ou à contacter un professionnel de santé mentale. Vous n'êtes pas seul.";
        }
        if (lower.contains("travail") || lower.contains("emploi") || lower.contains("chômage") || lower.contains("cherche") || lower.contains("cv") || lower.contains("entretien")) {
            return "Pour la recherche d'emploi, préparez un CV clair, ciblez les offres correspondant à votre profil, et pratiquez vos entretiens. Si vous êtes au chômage, renseignez-vous sur les aides disponibles dans votre région.";
        }
        if (lower.contains("logement") || lower.contains("loyer") || lower.contains("maison") || lower.contains("appartement") || lower.contains("sans abri")) {
            return "Pour les questions de logement, renseignez-vous auprès des services sociaux, des associations d'aide au logement ou des plateformes officielles. Si vous êtes en situation de précarité, des structures peuvent vous accompagner.";
        }
        if (lower.contains("transport") || lower.contains("voiture") || lower.contains("bus") || lower.contains("train") || lower.contains("avion")) {
            return "Pour les transports, je peux vous donner des conseils généraux : planifiez vos trajets à l'avance, comparez les moyens de transport et vérifiez les horaires. Si vous avez besoin d'aide pour un trajet spécifique, donnez-moi plus de détails.";
        }
        if (lower.contains("étude") || lower.contains("école") || lower.contains("université") || lower.contains("examen") || lower.contains("formation")) {
            return "Pour les études, organisez votre temps, utilisez des méthodes de révision efficaces, et n'hésitez pas à demander de l'aide à vos professeurs ou camarades. Si vous cherchez une formation, renseignez-vous sur les diplômes et les débouchés.";
        }

        String[] genericReplies = {
            "Je comprends votre question. Même si ce sujet n'est pas directement lié aux fonctionnalités de l'application, je peux essayer de vous aider. Pouvez-vous me donner plus de détails ?",
            "C'est une question intéressante. Je peux vous donner des conseils généraux ou vous orienter vers les fonctionnalités de l'application si cela peut vous aider.",
            "Je suis là pour vous aider. Si votre question concerne l'application, je peux vous guider vers le bon module. Sinon, n'hésitez pas à me donner plus de contexte.",
            "Je peux vous aider sur de nombreux sujets. Si votre question est liée à l'application, je vous oriente directement. Sinon, décrivez-moi votre besoin et je ferai de mon mieux pour vous répondre.",
            "Merci pour votre question ! Je peux répondre sur les fonctionnalités de l'application, mais aussi échanger avec vous sur d'autres sujets. Que souhaitez-vous savoir ?",
            "Je suis un assistant polyvalent. Si votre question porte sur l'application, je vous réponds précisément. Sinon, je peux vous donner des conseils généraux ou vous orienter vers des ressources utiles.",
            "Votre question est notée. Même si elle sort du cadre strict de l'application, je peux essayer de vous fournir une réponse utile. Pouvez-vous préciser votre demande ?",
            "Je traite votre demande au mieux de mes capacités. Si elle concerne l'application, je vous donne la marche à suivre. Sinon, je peux vous conseiller ou vous orienter."
        };
        int index = Math.abs(message.hashCode()) % genericReplies.length;
        return genericReplies[index];
    }

    @PostMapping("/recommendations/analyze")
    public ResponseEntity<RecommendationResponse> analyzeRecommendations(@RequestBody RecommendationRequest request) {
        RecommendationRequest resolved = resolveUserId(request);
        RecommendationResponse response = recommendationClient.analyze(resolved);
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

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/fraud/alerts/{transactionId}/dismiss")
    public ResponseEntity<Map<String, Object>> dismissFraudAlert(@PathVariable String transactionId) {
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("transactionId", transactionId);
        result.put("dismissed", true);
        result.put("message", "Alerte marquee comme traitee");
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/fraud/alerts/{transactionId}/block")
    public ResponseEntity<Map<String, Object>> blockFraudAlert(@PathVariable String transactionId) {
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("transactionId", transactionId);
        result.put("blocked", true);
        result.put("message", "Transaction bloquee");
        return ResponseEntity.ok(result);
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

    private KycVerificationRequest resolveUserId(KycVerificationRequest request) {
        if (request != null && "current-user".equals(request.getUser_id())) {
            return KycVerificationRequest.builder()
                    .user_id(currentUserService.getCurrentUserId().toString())
                    .id_document_image(request.getId_document_image())
                    .full_name(request.getFull_name())
                    .date_of_birth(request.getDate_of_birth())
                    .nationality(request.getNationality())
                    .build();
        }
        return request;
    }

    private RecommendationRequest resolveUserId(RecommendationRequest request) {
        if (request != null && "current-user".equals(request.getUser_id())) {
            return RecommendationRequest.builder()
                    .user_id(currentUserService.getCurrentUserId().toString())
                    .transaction_history(request.getTransaction_history())
                    .current_balance(request.getCurrent_balance())
                    .currency(request.getCurrency())
                    .build();
        }
        return request;
    }
}
