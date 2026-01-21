package com.enterprise.workflow.controller;

import com.enterprise.workflow.dto.WorkflowRequest;
import com.enterprise.workflow.dto.WorkflowResponse;
import com.enterprise.workflow.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService service;

    @PostMapping
    public ResponseEntity<WorkflowResponse> createWorkflow(
            @RequestBody WorkflowRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.createWorkflow(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<WorkflowResponse>> getAllWorkflows() {
        return ResponseEntity.ok(service.getAllWorkflows());
    }
}
