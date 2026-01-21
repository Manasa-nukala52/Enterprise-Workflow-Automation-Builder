package com.enterprise.workflow.service;

import com.enterprise.workflow.entity.AuditLog;
import com.enterprise.workflow.entity.User;
import com.enterprise.workflow.repository.AuditLogRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @PostConstruct
    public void init() {
        AuditLog startupLog = AuditLog.builder()
                .action("SYSTEM_RESTART")
                .actorName("SYSTEM")
                .actorRole("SYSTEM")
                .details("Audit Log service initialized successfully.")
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(startupLog);
    }

    public void log(String action, User actor, String details) {
        if (actor == null)
            return;
        AuditLog logEntry = AuditLog.builder()
                .action(action)
                .actorName(actor.getFullName())
                .actorRole(actor.getRole().name())
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(logEntry);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
