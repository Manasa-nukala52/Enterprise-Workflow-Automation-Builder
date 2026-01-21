package com.enterprise.workflow.controller;

import com.enterprise.workflow.dto.WorkflowInstanceRequest;
import com.enterprise.workflow.dto.WorkflowInstanceResponse;
import com.enterprise.workflow.entity.WorkflowStatus;
import com.enterprise.workflow.service.WorkflowInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/instances")
@RequiredArgsConstructor
public class WorkflowInstanceController {

    private final WorkflowInstanceService service;

    @PostMapping
    public ResponseEntity<WorkflowInstanceResponse> submit(
            @RequestBody WorkflowInstanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.submitWorkflow(request, userDetails.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<WorkflowInstanceResponse>> getMyInstances(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.getMyInstances(userDetails.getUsername()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<WorkflowInstanceResponse>> getAllInstances(
            @RequestParam(required = false) WorkflowStatus status,
            @RequestParam(required = false) String owner,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(service.getAllInstances(status, owner, date, query));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<WorkflowInstanceResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body, // Expects "status" and "remarks"
            @AuthenticationPrincipal UserDetails userDetails) {
        WorkflowStatus status = WorkflowStatus.valueOf(body.get("status").toUpperCase());
        String remarks = body.get("remarks");
        return ResponseEntity.ok(service.updateStatus(id, status, remarks, userDetails.getUsername()));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<WorkflowInstanceResponse> assignTask(
            @PathVariable Long id,
            @RequestBody Map<String, String> body, // "assignedTo"
            @AuthenticationPrincipal UserDetails userDetails) {
        String assignedTo = body.get("assignedTo");
        return ResponseEntity.ok(service.assignTask(id, assignedTo, userDetails.getUsername()));
    }

    @PutMapping("/{id}/details")
    public ResponseEntity<WorkflowInstanceResponse> updateTaskDetails(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body, // "dueDate", "priority"
            @AuthenticationPrincipal UserDetails userDetails) {

        java.time.LocalDateTime dueDate = null;
        if (body.get("dueDate") != null) {
            dueDate = java.time.LocalDateTime.parse((String) body.get("dueDate"));
        }

        com.enterprise.workflow.entity.Priority priority = null;
        if (body.get("priority") != null) {
            priority = com.enterprise.workflow.entity.Priority.valueOf((String) body.get("priority"));
        }

        return ResponseEntity.ok(service.updateTaskDetails(id, dueDate, priority, userDetails.getUsername()));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<WorkflowInstanceResponse>> getAssignedTasks(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.getAssignedTasks(userDetails.getUsername()));
    }
}
