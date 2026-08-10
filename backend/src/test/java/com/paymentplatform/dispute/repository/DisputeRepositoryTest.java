package com.paymentplatform.dispute.repository;

import com.paymentplatform.dispute.entity.Dispute;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class DisputeRepositoryTest {

    @Autowired
    private DisputeRepository disputeRepository;

    @Test
    void shouldResolveQueryByCreatedById() {
        UUID userId = UUID.randomUUID();

        List<Dispute> disputes = disputeRepository.findByCreatedById(userId);

        assertThat(disputes).isNotNull();
    }
}
