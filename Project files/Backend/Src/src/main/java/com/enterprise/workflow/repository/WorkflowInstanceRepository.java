package com.enterprise.workflow.repository;

import com.enterprise.workflow.entity.WorkflowInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowInstanceRepository
        extends JpaRepository<WorkflowInstance, Long>, JpaSpecificationExecutor<WorkflowInstance> {
    List<WorkflowInstance> findByUserIdOrderBySubmittedAtDesc(Long userId);

    List<WorkflowInstance> findByWorkflowIdOrderBySubmittedAtDesc(Long workflowId);

    List<WorkflowInstance> findByAssignedToIdOrderBySubmittedAtDesc(Long assignedToId);
}
