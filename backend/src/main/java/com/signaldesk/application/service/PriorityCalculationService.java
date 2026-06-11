package com.signaldesk.application.service;

import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.enums.PriorityLevel;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class PriorityCalculationService {

    public Task calculate(Task task) {
        int score = 0;
        score += deadlineScore(task.getDeadline());
        score += importanceScore(task.getImportanceScore());
        score += urgencyScore(task.getUrgencyScore());
        score -= effortPenalty(task.getEstimatedMinutes());

        task.setPriorityScore(score);
        task.setPriorityLevel(toPriorityLevel(score));
        return task;
    }

    private int deadlineScore(LocalDateTime deadline) {
        if (deadline == null) return 0;
        long days = ChronoUnit.DAYS.between(LocalDateTime.now(), deadline);
        if (days <= 0) return 40;
        if (days <= 1) return 30;
        if (days <= 3) return 20;
        if (days <= 7) return 10;
        return 0;
    }

    private int importanceScore(Integer importance) {
        if (importance == null) return 0;
        return Math.min(importance, 10) * 5;
    }

    private int urgencyScore(Integer urgency) {
        if (urgency == null) return 0;
        return Math.min(urgency, 10) * 3;
    }

    private int effortPenalty(Integer minutes) {
        if (minutes == null || minutes <= 30) return 0;
        if (minutes <= 60) return 5;
        if (minutes <= 120) return 10;
        return 20;
    }

    private PriorityLevel toPriorityLevel(int score) {
        if (score >= 100) return PriorityLevel.A_MUST_DO_TODAY;
        if (score >= 70) return PriorityLevel.B_SHOULD_DO_TODAY;
        if (score >= 40) return PriorityLevel.C_THIS_WEEK;
        if (score >= 20) return PriorityLevel.D_WAITING;
        return PriorityLevel.E_LATER_OR_DELETE;
    }
}
