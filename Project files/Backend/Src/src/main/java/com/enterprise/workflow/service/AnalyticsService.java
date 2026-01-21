package com.enterprise.workflow.service;

import com.enterprise.workflow.dto.AnalyticsResponse;
import com.enterprise.workflow.entity.WorkflowInstance;
import com.enterprise.workflow.entity.WorkflowStatus;
import com.enterprise.workflow.repository.WorkflowInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final WorkflowInstanceRepository instanceRepository;

    public AnalyticsResponse getSystemAnalytics() {
        List<WorkflowInstance> allInstances = instanceRepository.findAll();

        return AnalyticsResponse.builder()
                .summary(calculateSummary(allInstances))
                .performance(calculatePerformance(allInstances))
                .statusDistribution(calculateStatusDistribution(allInstances))
                .trends(calculateTrends(allInstances))
                .build();
    }

    private AnalyticsResponse.SummaryStats calculateSummary(List<WorkflowInstance> instances) {
        long total = instances.size();
        if (total == 0)
            return new AnalyticsResponse.SummaryStats(0, 0, 0, 0);

        long approved = instances.stream().filter(i -> i.getStatus() == WorkflowStatus.APPROVED).count();
        long pending = instances.stream().filter(i -> i.getStatus() == WorkflowStatus.PENDING).count();

        double avgCompletionTime = instances.stream()
                .filter(i -> i.getStatus() == WorkflowStatus.APPROVED || i.getStatus() == WorkflowStatus.REJECTED)
                .filter(i -> i.getUpdatedAt() != null)
                .mapToLong(i -> Duration.between(i.getSubmittedAt(), i.getUpdatedAt()).toHours())
                .average()
                .orElse(0.0);

        return AnalyticsResponse.SummaryStats.builder()
                .totalWorkflows(total)
                .completionRate(total > 0 ? (double) approved / total * 100 : 0)
                .averageCompletionTimeHours(avgCompletionTime)
                .totalPending(pending)
                .build();
    }

    private List<AnalyticsResponse.WorkflowPerformance> calculatePerformance(List<WorkflowInstance> instances) {
        return instances.stream()
                .collect(Collectors.groupingBy(i -> i.getWorkflow().getTitle()))
                .entrySet().stream()
                .map(entry -> {
                    String title = entry.getKey();
                    List<WorkflowInstance> group = entry.getValue();

                    long completedCount = group.stream()
                            .filter(i -> i.getStatus() == WorkflowStatus.APPROVED
                                    || i.getStatus() == WorkflowStatus.REJECTED)
                            .count();

                    double avgTime = group.stream()
                            .filter(i -> i.getStatus() == WorkflowStatus.APPROVED
                                    || i.getStatus() == WorkflowStatus.REJECTED)
                            .filter(i -> i.getUpdatedAt() != null)
                            .mapToLong(i -> Duration.between(i.getSubmittedAt(), i.getUpdatedAt()).toHours())
                            .average()
                            .orElse(0.0);

                    return AnalyticsResponse.WorkflowPerformance.builder()
                            .workflowTitle(title)
                            .completedCount(completedCount)
                            .averageTimeHours(avgTime)
                            .bottleneckRisk(avgTime > 48 ? "HIGH" : avgTime > 24 ? "MEDIUM" : "LOW")
                            .build();
                })
                .sorted(Comparator.comparingDouble(AnalyticsResponse.WorkflowPerformance::getAverageTimeHours)
                        .reversed())
                .collect(Collectors.toList());
    }

    private Map<String, Long> calculateStatusDistribution(List<WorkflowInstance> instances) {
        return instances.stream()
                .collect(Collectors.groupingBy(i -> i.getStatus().name(), Collectors.counting()));
    }

    private List<AnalyticsResponse.DailyTrend> calculateTrends(List<WorkflowInstance> instances) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        Map<String, Long> completionsByDate = instances.stream()
                .filter(i -> i.getStatus() == WorkflowStatus.APPROVED || i.getStatus() == WorkflowStatus.REJECTED)
                .filter(i -> i.getUpdatedAt() != null && i.getUpdatedAt().isAfter(sevenDaysAgo))
                .collect(Collectors.groupingBy(i -> i.getUpdatedAt().format(formatter), Collectors.counting()));

        Map<String, Long> submissionsByDate = instances.stream()
                .filter(i -> i.getSubmittedAt().isAfter(sevenDaysAgo))
                .collect(Collectors.groupingBy(i -> i.getSubmittedAt().format(formatter), Collectors.counting()));

        // Merge dates from both sets to ensure trend line is continuous
        Set<String> allDates = new TreeSet<>(completionsByDate.keySet());
        allDates.addAll(submissionsByDate.keySet());

        return allDates.stream()
                .map(date -> AnalyticsResponse.DailyTrend.builder()
                        .date(date)
                        .completedCount(completionsByDate.getOrDefault(date, 0L))
                        .submittedCount(submissionsByDate.getOrDefault(date, 0L))
                        .build())
                .collect(Collectors.toList());
    }
}
