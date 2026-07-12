package com.signaldesk.api.dto;

import com.signaldesk.domain.entity.Goal;
import com.signaldesk.domain.entity.enums.GoalType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class GoalResponse {
    private Long id;
    private String title;
    private String description;
    private GoalType goalType;
    private Long parentId;
    private LocalDate targetDate;
    private int progress;
    private long linkedTaskCount;
    private long completedTaskCount;
    private LocalDateTime createdAt;

    public static GoalResponse from(Goal goal, long linkedTaskCount, long completedTaskCount) {
        GoalResponse r = new GoalResponse();
        r.setId(goal.getId());
        r.setTitle(goal.getTitle());
        r.setDescription(goal.getDescription());
        r.setGoalType(goal.getGoalType());
        r.setParentId(goal.getParent() != null ? goal.getParent().getId() : null);
        r.setTargetDate(goal.getTargetDate());
        r.setLinkedTaskCount(linkedTaskCount);
        r.setCompletedTaskCount(completedTaskCount);
        r.setProgress(linkedTaskCount == 0 ? 0
            : (int) Math.round(100.0 * completedTaskCount / linkedTaskCount));
        r.setCreatedAt(goal.getCreatedAt());
        return r;
    }
}
