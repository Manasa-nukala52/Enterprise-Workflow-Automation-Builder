package com.enterprise.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private SummaryStats summary;
    private List<WorkflowPerformance> performance;
    private List<DailyTrend> trends;
    private Map<String, Long> statusDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStats {
        private long totalWorkflows;
        private double completionRate;
        private double averageCompletionTimeHours;
        private long totalPending;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkflowPerformance {
        private String workflowTitle;
        private long completedCount;
        private double averageTimeHours;
        private String bottleneckRisk; // "HIGH" if > X hours
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyTrend {
        private String date;
        private long completedCount;
        private long submittedCount;
    }
}
