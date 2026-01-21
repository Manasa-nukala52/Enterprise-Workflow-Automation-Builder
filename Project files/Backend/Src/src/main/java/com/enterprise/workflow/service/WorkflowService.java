package com.enterprise.workflow.service;

import com.enterprise.workflow.dto.WorkflowRequest;
import com.enterprise.workflow.dto.WorkflowResponse;
import com.enterprise.workflow.entity.User;
import com.enterprise.workflow.entity.Workflow;
import com.enterprise.workflow.repository.UserRepository;
import com.enterprise.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final UserRepository userRepository;

    public WorkflowResponse createWorkflow(WorkflowRequest request, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Workflow workflow = Workflow.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .createdBy(creator)
                .build();

        Workflow saved = workflowRepository.save(workflow);
        return mapToResponse(saved);
    }

    public List<WorkflowResponse> getAllWorkflows() {
        return workflowRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private WorkflowResponse mapToResponse(Workflow workflow) {
        return WorkflowResponse.builder()
                .id(workflow.getId())
                .title(workflow.getTitle())
                .description(workflow.getDescription())
                .createdBy(workflow.getCreatedBy().getFullName())
                .createdAt(workflow.getCreatedAt())
                .build();
    }
}
