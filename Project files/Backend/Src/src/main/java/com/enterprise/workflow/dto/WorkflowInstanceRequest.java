package com.enterprise.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkflowInstanceRequest {
    private Long workflowId;
    private String description;
    private com.enterprise.workflow.entity.Priority priority;
    private java.time.LocalDateTime dueDate;
}
