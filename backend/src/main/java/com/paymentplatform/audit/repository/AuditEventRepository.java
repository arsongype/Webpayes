package com.paymentplatform.audit.repository;

import com.paymentplatform.audit.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {

    Page<AuditEvent> findAllByOrderByEventTimeDesc(Pageable pageable);

    Page<AuditEvent> findByActorIdOrderByEventTimeDesc(UUID actorId, Pageable pageable);

    Page<AuditEvent> findByEventTypeOrderByEventTimeDesc(String eventType, Pageable pageable);

    Page<AuditEvent> findByEventTimeBetweenOrderByEventTimeDesc(Instant from, Instant to, Pageable pageable);

    @Query("SELECT a FROM AuditEvent a WHERE a.actorId = :actorId AND a.eventTime >= :since ORDER BY a.eventTime DESC")
    List<AuditEvent> findByActorIdAndEventTimeAfter(@Param("actorId") UUID actorId, @Param("since") Instant since);

    long countByEventTypeAndOutcome(String eventType, AuditEvent.Outcome outcome);
}
