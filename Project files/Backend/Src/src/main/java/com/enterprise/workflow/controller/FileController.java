package com.enterprise.workflow.controller;

import com.enterprise.workflow.entity.FileAttachment;
import com.enterprise.workflow.entity.User;
import com.enterprise.workflow.entity.WorkflowInstance;
import com.enterprise.workflow.repository.FileAttachmentRepository;
import com.enterprise.workflow.repository.UserRepository;
import com.enterprise.workflow.repository.WorkflowInstanceRepository;
import com.enterprise.workflow.service.FileStorageService;
import com.enterprise.workflow.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

        private final FileStorageService fileStorageService;
        private final FileAttachmentRepository fileAttachmentRepository;
        private final WorkflowInstanceRepository workflowInstanceRepository;
        private final UserRepository userRepository;
        private final AuditLogService auditLogService;

        @GetMapping("/health")
        public ResponseEntity<String> healthCheck() {
                return ResponseEntity.ok("File Controller is active");
        }

        @PostMapping("/upload/{instanceId}")
        public ResponseEntity<com.enterprise.workflow.dto.FileAttachmentResponse> uploadFile(
                        @PathVariable Long instanceId,
                        @RequestParam("file") MultipartFile file,
                        @AuthenticationPrincipal UserDetails userDetails) throws IOException {

                System.out.println("Uploading file: " + file.getOriginalFilename() + " (size: " + file.getSize()
                                + ") for Instance ID " + instanceId);

                System.out.println("Uploading file: " + file.getOriginalFilename() + " (size: " + file.getSize()
                                + ") for Instance ID " + instanceId);
                WorkflowInstance instance = workflowInstanceRepository.findById(instanceId)
                                .orElseThrow(() -> new RuntimeException("Instance not found"));

                if (userDetails == null || userDetails.getUsername() == null) {
                        throw new RuntimeException("User not authenticated");
                }

                User user = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String originalFileName = file.getOriginalFilename();
                if (originalFileName == null) {
                        throw new RuntimeException("File name is invalid");
                }

                String storedFileName = fileStorageService.storeFile(file);

                FileAttachment attachment = FileAttachment.builder()
                                .fileName(originalFileName)
                                .fileType(file.getContentType() != null ? file.getContentType()
                                                : "application/octet-stream")
                                .filePath(storedFileName)
                                .fileSize(file.getSize())
                                .instance(instance)
                                .uploadedBy(user)
                                .build();

                FileAttachment savedAttachment = fileAttachmentRepository.save(attachment);
                System.out.println("Saved attachment to DB with ID: " + savedAttachment.getId());

                auditLogService.log("UPLOAD_FILE", user,
                                String.format("Uploaded file '%s' for Instance ID %d", attachment.getFileName(),
                                                instanceId));

                return ResponseEntity.ok(mapToResponse(savedAttachment));
        }

        @GetMapping("/instance/{instanceId}")
        public ResponseEntity<List<com.enterprise.workflow.dto.FileAttachmentResponse>> getFilesByInstance(
                        @PathVariable Long instanceId) {
                List<FileAttachment> attachments = fileAttachmentRepository.findByInstanceId(instanceId);
                List<com.enterprise.workflow.dto.FileAttachmentResponse> response = attachments.stream()
                                .map(this::mapToResponse)
                                .toList();
                return ResponseEntity.ok(response);
        }

        private com.enterprise.workflow.dto.FileAttachmentResponse mapToResponse(FileAttachment attachment) {
                return com.enterprise.workflow.dto.FileAttachmentResponse.builder()
                                .id(attachment.getId())
                                .fileName(attachment.getFileName())
                                .fileType(attachment.getFileType())
                                .fileSize(attachment.getFileSize())
                                .uploadedBy(attachment.getUploadedBy().getFullName())
                                .uploadedAt(attachment.getUploadedAt())
                                .build();
        }

        @GetMapping("/download/{id}")
        public ResponseEntity<Resource> downloadFile(@PathVariable Long id) throws IOException {
                FileAttachment attachment = fileAttachmentRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Attachment not found"));

                Path filePath = fileStorageService.loadFile(attachment.getFilePath());
                Resource resource = new UrlResource(filePath.toUri());

                if (!resource.exists()) {
                        throw new RuntimeException("File not found");
                }

                return ResponseEntity.ok()
                                .contentType(MediaType.parseMediaType(attachment.getFileType()))
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"" + attachment.getFileName() + "\"")
                                .body(resource);
        }
}
