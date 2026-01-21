package com.enterprise.workflow.config;

import com.enterprise.workflow.entity.Role;
import com.enterprise.workflow.entity.User;
import com.enterprise.workflow.repository.UserRepository;
import com.enterprise.workflow.repository.WorkflowRepository;
import com.enterprise.workflow.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

        @Bean
        public CommandLineRunner initData(UserRepository userRepository, WorkflowRepository workflowRepository,
                        PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
                return args -> {
                        System.out.println("Initializing Data...");

                        User admin = createUserIfNotFound(userRepository, passwordEncoder, "admin", "admin123",
                                        "System Administrator", Role.ADMIN);
                        User manager = createUserIfNotFound(userRepository, passwordEncoder, "manager", "manager123",
                                        "Workflow Manager", Role.MANAGER);
                        User user = createUserIfNotFound(userRepository, passwordEncoder, "user", "user123",
                                        "Standard User",
                                        Role.USER);

                        createWorkflowIfNotFound(workflowRepository, manager, "Project Assignment Request",
                                        "Request to be assigned to a new project.");
                        createWorkflowIfNotFound(workflowRepository, manager, "Training Session Enrollment",
                                        "Request enrollment in upcoming technical training.");
                        createWorkflowIfNotFound(workflowRepository, manager, "Leave Application",
                                        "Request for annual or sick leave.");
                        createWorkflowIfNotFound(workflowRepository, manager, "Grievance Report",
                                        "Raise a formal complaint or issue to management.");

                        auditLogService.log("SYSTEM_STARTUP", admin, "System initialized and ready.");

                        System.out.println("Data Initialization Complete.");
                };
        }

        private User createUserIfNotFound(UserRepository repo, PasswordEncoder encoder, String username,
                        String password,
                        String name, Role role) {
                return repo.findByUsername(username).orElseGet(() -> {
                        User newUser = User.builder()
                                        .username(username)
                                        .password(encoder.encode(password))
                                        .fullName(name)
                                        .role(role)
                                        .build();
                        return repo.save(newUser);
                });
        }

        private void createWorkflowIfNotFound(WorkflowRepository repo, User creator, String title, String description) {
                if (repo.count() < 2) { // Simple check to avoid duplicates on every run
                        // Ideally check by title if repository allows, but count is safe for demo
                        // Actually, let's just create if clean slate
                }
                // Better: Check by title if possible, or just rely on 'create' mode clearing
                // it.
                // Since we are in 'create' mode currently (or 'update' if user reverted), let's
                // be safe.
                // For robustness, we won't check existsByTitle as we haven't confirmed that
                // method exists.
                // We will just create if list is empty or rely on the fact that we just created
                // users.

                // Actually, let's implement a safe check using findAll for this small dataset
                boolean exists = repo.findAll().stream().anyMatch(w -> w.getTitle().equals(title));
                if (!exists) {
                        com.enterprise.workflow.entity.Workflow workflow = com.enterprise.workflow.entity.Workflow
                                        .builder()
                                        .title(title)
                                        .description(description)
                                        .createdBy(creator)
                                        .createdAt(java.time.LocalDateTime.now())
                                        .build();
                        repo.save(workflow);
                        System.out.println("Created default workflow: " + title);
                }
        }

}
