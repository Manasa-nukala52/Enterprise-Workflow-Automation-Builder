package com.enterprise.workflow.service;

import com.enterprise.workflow.dto.WorkflowInstanceRequest;
import com.enterprise.workflow.dto.WorkflowInstanceResponse;
import com.enterprise.workflow.entity.User;
import com.enterprise.workflow.entity.Workflow;
import com.enterprise.workflow.entity.WorkflowInstance;
import com.enterprise.workflow.entity.WorkflowStatus;
import com.enterprise.workflow.repository.UserRepository;
import com.enterprise.workflow.repository.WorkflowInstanceRepository;
import com.enterprise.workflow.repository.WorkflowRepository;
import com.enterprise.workflow.model.Notification;
import com.enterprise.workflow.repository.NotificationRepository;
import com.enterprise.workflow.repository.FileAttachmentRepository;
import com.enterprise.workflow.dto.FileAttachmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.enterprise.workflow.service.AuditLogService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowInstanceService {

        private final WorkflowInstanceRepository instanceRepository;
        private final WorkflowRepository workflowRepository;
        private final UserRepository userRepository;
        private final NotificationRepository notificationRepository;
        private final FileAttachmentRepository fileAttachmentRepository;
        private final AuditLogService auditLogService;

        public WorkflowInstanceResponse submitWorkflow(WorkflowInstanceRequest request, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                Workflow workflow = workflowRepository.findById(request.getWorkflowId())
                                .orElseThrow(() -> new RuntimeException("Workflow not found"));

                WorkflowInstance instance = WorkflowInstance.builder()
                                .workflow(workflow)
                                .user(user)
                                .description(request.getDescription())
                                .priority(request.getPriority())
                                .dueDate(request.getDueDate())
                                .build();

                WorkflowInstance savedInstance = instanceRepository.save(instance);
                auditLogService.log("SUBMIT_WORKFLOW", user,
                                String.format("Submitted request for workflow: %s (Instance ID: %d)",
                                                workflow.getTitle(), savedInstance.getId()));
                return mapToResponse(savedInstance);
        }

        public List<WorkflowInstanceResponse> getMyInstances(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                return instanceRepository.findByUserIdOrderBySubmittedAtDesc(user.getId()).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<WorkflowInstanceResponse> getAllInstances(WorkflowStatus status, String owner, LocalDate date,
                        String query) {
                Specification<WorkflowInstance> spec = (root, criteriaQuery, cb) -> {
                        List<Predicate> predicates = new ArrayList<>();

                        if (status != null) {
                                predicates.add(cb.equal(root.get("status"), status));
                        }

                        if (owner != null && !owner.isEmpty()) {
                                predicates.add(cb.like(cb.lower(root.get("user").get("fullName")),
                                                "%" + owner.toLowerCase() + "%"));
                        }

                        if (date != null) {
                                LocalDateTime startOfDay = date.atStartOfDay();
                                LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
                                predicates.add(cb.between(root.get("submittedAt"), startOfDay, endOfDay));
                        }

                        if (query != null && !query.isEmpty()) {
                                String lcaseQuery = "%" + query.toLowerCase() + "%";
                                predicates.add(cb.or(
                                                cb.like(cb.lower(root.get("workflow").get("title")), lcaseQuery),
                                                cb.like(cb.lower(root.get("description")), lcaseQuery)));
                        }

                        return cb.and(predicates.toArray(new Predicate[0]));
                };

                return instanceRepository.findAll(spec).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<WorkflowInstanceResponse> getAllInstances() {
                return getAllInstances(null, null, null, null);
        }

        public WorkflowInstanceResponse updateStatus(Long id, WorkflowStatus status, String remarks,
                        String approverUsername) {
                WorkflowInstance instance = instanceRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Instance not found"));

                User approver = userRepository.findByUsername(approverUsername)
                                .orElseThrow(() -> new UsernameNotFoundException("Approver not found"));

                System.out.println("Processing UpdateStatus: InstanceId=" + id + ", Status=" + status + ", Approver="
                                + approverUsername + ", Role=" + approver.getRole());
                // 2. Role Check (Simple Manager Check)
                if (approver.getRole() == com.enterprise.workflow.entity.Role.MANAGER
                                && instance.getUser().getRole() != com.enterprise.workflow.entity.Role.USER) {
                        throw new RuntimeException("Managers can only approve workflows for Users.");
                }

                if (status == WorkflowStatus.APPROVED) {
                        instance.setStatus(WorkflowStatus.APPROVED);
                        instance.setRemarks(remarks);
                } else if (status == WorkflowStatus.CHANGES_REQUESTED) {
                        instance.setStatus(WorkflowStatus.CHANGES_REQUESTED);
                        instance.setRemarks(remarks);
                } else {
                        // REJECTED
                        instance.setStatus(status);
                        instance.setRemarks(remarks);
                }

                WorkflowInstance savedInstance = instanceRepository.save(instance);

                auditLogService.log("UPDATE_STATUS", approver,
                                String.format("Updated status of Instance ID %d to %s. Remarks: %s",
                                                id, status, remarks));

                // Create Notification
                String message = String.format("Update on '%s': %s",
                                instance.getWorkflow().getTitle(), instance.getRemarks());
                notificationRepository.save(new Notification(instance.getUser().getId(), message));

                return mapToResponse(savedInstance);
        }

        public WorkflowInstanceResponse assignTask(Long id, String assignedToUsername, String assignerUsername) {
                WorkflowInstance instance = instanceRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Instance not found"));

                // Optional: Check if assigner has permission (e.g. is Manager/Admin)
                // For now, assuming any authenticated user can assign/reassign (or restrict to
                // ADMIN/MANAGER)
                User assigner = userRepository.findByUsername(assignerUsername)
                                .orElseThrow(() -> new UsernameNotFoundException("Assigner not found"));

                // Allow assignment by Admin/Manager or the current assignee?
                // Let's allow Admin/Manager to assign.
                // Simple check:
                if (assigner.getRole() == com.enterprise.workflow.entity.Role.USER) {
                        throw new RuntimeException("Only Managers and Admins can assign tasks.");
                }

                User assignee = userRepository.findByUsername(assignedToUsername)
                                .orElseThrow(() -> new UsernameNotFoundException("Assignee not found"));

                instance.setAssignedTo(assignee);
                WorkflowInstance savedInstance = instanceRepository.save(instance);

                auditLogService.log("ASSIGN_TASK", assigner,
                                String.format("Assigned Instance ID %d to %s", id, assignee.getFullName()));

                // Notification
                String message = String.format("You have been assigned the task '%s' by %s.",
                                instance.getWorkflow().getTitle(), assigner.getFullName());
                notificationRepository.save(new Notification(assignee.getId(), message));

                return mapToResponse(savedInstance);
        }

        public WorkflowInstanceResponse updateTaskDetails(Long id, java.time.LocalDateTime dueDate,
                        com.enterprise.workflow.entity.Priority priority, String username) {
                WorkflowInstance instance = instanceRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Instance not found"));

                // Permission check?

                if (dueDate != null)
                        instance.setDueDate(dueDate);
                if (priority != null)
                        instance.setPriority(priority);

                return mapToResponse(instanceRepository.save(instance));
        }

        public List<WorkflowInstanceResponse> getAssignedTasks(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                return instanceRepository.findByAssignedToIdOrderBySubmittedAtDesc(user.getId()).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        private WorkflowInstanceResponse mapToResponse(WorkflowInstance instance) {
                List<FileAttachmentResponse> attachments = fileAttachmentRepository.findByInstanceId(instance.getId())
                                .stream()
                                .map(fa -> FileAttachmentResponse.builder()
                                                .id(fa.getId())
                                                .fileName(fa.getFileName())
                                                .fileType(fa.getFileType())
                                                .fileSize(fa.getFileSize())
                                                .uploadedBy(fa.getUploadedBy().getFullName())
                                                .uploadedAt(fa.getUploadedAt())
                                                .build())
                                .collect(Collectors.toList());

                System.out.println("Mapping Instance ID " + instance.getId() + " - Found " + attachments.size()
                                + " attachments");

                return WorkflowInstanceResponse.builder()
                                .id(instance.getId())
                                .workflowTitle(instance.getWorkflow().getTitle())
                                .applicantName(instance.getUser().getFullName())
                                .status(instance.getStatus())
                                .remarks(instance.getRemarks())
                                .description(instance.getDescription())
                                .submittedAt(instance.getSubmittedAt())
                                .updatedAt(instance.getUpdatedAt())
                                .assignedToName(instance.getAssignedTo() != null
                                                ? instance.getAssignedTo().getFullName()
                                                : null)
                                .priority(instance.getPriority())
                                .dueDate(instance.getDueDate())
                                .currentStepName(instance.getCurrentStep() != null ? instance.getCurrentStep().getName()
                                                : null)
                                .attachments(attachments)
                                .build();
        }
}
