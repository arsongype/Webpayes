package com.paymentplatform.audit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymentplatform.audit.entity.AuditEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class WormStorageServiceTest {

    private WormStorageService wormStorageService;
    private Path tempDir;

    @BeforeEach
    void setUp() throws IOException {
        wormStorageService = new WormStorageService(new ObjectMapper());
        tempDir = Files.createTempDirectory("worm-test");
        ReflectionTestUtils.setField(wormStorageService, "wormEnabled", true);
        ReflectionTestUtils.setField(wormStorageService, "wormDirectory", tempDir.toString());
        ReflectionTestUtils.setField(wormStorageService, "encryptionKey", "test-secret-key-for-worm");
    }

    @Test
    void append_writesEncryptedLineToFile() throws Exception {
        AuditEvent event = AuditEvent.builder()
                .id(java.util.UUID.randomUUID())
                .eventTime(java.time.Instant.now())
                .eventType("TEST")
                .action("CREATE")
                .outcome(AuditEvent.Outcome.SUCCESS)
                .resourceType("TEST_RESOURCE")
                .resourceId("RES-1")
                .description("Test WORM append")
                .build();

        wormStorageService.append(event, Map.of("key", "value"));

        String day = event.getEventTime().toString().substring(0, 10);
        Path dayFile = tempDir.resolve("audit-" + day + ".log.enc");
        assertTrue(Files.exists(dayFile), "WORM log file should exist at: " + dayFile);
    }

    @Test
    void append_disabled_doesNotWriteFile() throws Exception {
        ReflectionTestUtils.setField(wormStorageService, "wormEnabled", false);

        AuditEvent event = AuditEvent.builder()
                .id(java.util.UUID.randomUUID())
                .eventTime(java.time.Instant.now())
                .eventType("TEST")
                .action("CREATE")
                .outcome(AuditEvent.Outcome.SUCCESS)
                .build();

        wormStorageService.append(event, Map.of());

        assertFalse(Files.exists(tempDir.resolve("audit-" + event.getEventTime().toString().substring(0, 10) + ".log.enc")));
    }

    @Test
    void append_multipleEvents_appendsToSameFile() throws Exception {
        java.time.Instant now = java.time.Instant.now();
        String day = now.toString().substring(0, 10);

        for (int i = 0; i < 3; i++) {
            AuditEvent event = AuditEvent.builder()
                    .id(java.util.UUID.randomUUID())
                    .eventTime(now)
                    .eventType("TEST")
                    .action("CREATE")
                    .outcome(AuditEvent.Outcome.SUCCESS)
                    .build();
            wormStorageService.append(event, Map.of("index", i));
        }

        Path file = tempDir.resolve("audit-" + day + ".log.enc");
        if (!Files.exists(file)) {
            fail("WORM log file should exist at: " + file + ", dir contents: " + java.util.Arrays.toString(tempDir.toFile().list()));
        }
        long lineCount = Files.lines(file).count();
        assertEquals(3, lineCount, "WORM log should contain 3 lines");
    }
}
