package com.signaldesk.api.dto;

import com.signaldesk.domain.entity.Goal;
import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.enums.EnergyLevel;
import com.signaldesk.domain.entity.enums.PriorityLevel;
import com.signaldesk.domain.entity.enums.TaskStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private LocalDateTime deadline;
    private Integer estimatedMinutes;
    private Integer importanceScore;
    private Integer urgencyScore;
    private Integer priorityScore;
    private PriorityLevel priorityLevel;
    private EnergyLevel energyLevel;
    private TaskStatus status;
    private LocalDateTime recommendedStartTime;
    private LocalDateTime recommendedEndTime;
    private String reason;
    private LocalDateTime createdAt;
    private List<Long> goalIds;

    public static TaskResponse from(Task task) {
        TaskResponse r = new TaskResponse();
        r.setId(task.getId());
        r.setTitle(task.getTitle());
        r.setDescription(task.getDescription());
        r.setCategory(task.getCategory());
        r.setDeadline(task.getDeadline());
        r.setEstimatedMinutes(task.getEstimatedMinutes());
        r.setImportanceScore(task.getImportanceScore());
        r.setUrgencyScore(task.getUrgencyScore());
        r.setPriorityScore(task.getPriorityScore());
        r.setPriorityLevel(task.getPriorityLevel());
        r.setEnergyLevel(task.getEnergyLevel());
        r.setStatus(task.getStatus());
        r.setRecommendedStartTime(task.getRecommendedStartTime());
        r.setRecommendedEndTime(task.getRecommendedEndTime());
        r.setReason(task.getReason());
        r.setCreatedAt(task.getCreatedAt());
        r.setGoalIds(task.getGoals().stream().map(Goal::getId).sorted().toList());
        return r;
    }
}
