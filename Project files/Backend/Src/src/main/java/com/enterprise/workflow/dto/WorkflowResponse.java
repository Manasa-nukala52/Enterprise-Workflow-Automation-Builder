package com.enterprise.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkflowResponse {
    private Long id;
    private String title;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
}
