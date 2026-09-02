package com.paymentplatform.merchantaffiliation.entity;

import com.paymentplatform.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "merchant_affiliation_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerchantAffiliationRequest {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "id_document_image", columnDefinition = "TEXT")
    private String idDocumentImage;

    @Column(name = "id_document_type", length = 20)
    private String idDocumentType;

    @Column(name = "id_document_number", length = 100)
    private String idDocumentNumber;

    @Column(name = "business_registration_image", columnDefinition = "TEXT")
    private String businessRegistrationImage;

    @Column(name = "kyc_status", length = 20)
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private KycStatus kycStatus = KycStatus.PENDING;

    @Column(name = "kyc_submitted_at")
    private Instant kycSubmittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AffiliationRequestStatus status = AffiliationRequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
