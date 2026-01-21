package com.enterprise.workflow.dto;

import com.enterprise.workflow.entity.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkflowInstanceResponse {
    private Long id;
    private String workflowTitle;
    private String applicantName;
    private WorkflowStatus status;
    private String remarks;
    private String description;
    private LocalDateTime submittedAt;

    private LocalDateTime updatedAt;
    private String assignedToName;
    private com.enterprise.workflow.entity.Priority priority;
    private LocalDateTime dueDate;
    private String currentStepName;
    private List<FileAttachmentResponse> attachments;
}
