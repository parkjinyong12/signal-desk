package com.signaldesk.api.controller;

import com.signaldesk.api.dto.GoalRequest;
import com.signaldesk.api.dto.GoalResponse;
import com.signaldesk.api.dto.TaskResponse;
import com.signaldesk.domain.entity.Goal;
import com.signaldesk.domain.entity.enums.GoalStatus;
import com.signaldesk.domain.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GoalController {

    private final GoalService goalService;

    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping
    public List<GoalResponse> getGoals() {
        Map<Long, GoalService.GoalProgress> progress = goalService.computeProgressForUser(DEFAULT_USER_ID);
        return goalService.getAllGoals(DEFAULT_USER_ID).stream()
            .map(g -> toResponse(g, progress))
            .toList();
    }

    @GetMapping("/{id}")
    public GoalResponse getGoal(@PathVariable Long id) {
        Goal goal = goalService.getGoal(id);
        Map<Long, GoalService.GoalProgress> progress = goalService.computeProgressForUser(DEFAULT_USER_ID);
        return toResponse(goal, progress);
    }

    @GetMapping("/{id}/children")
    public List<GoalResponse> getChildren(@PathVariable Long id) {
        goalService.getGoal(id);
        Map<Long, GoalService.GoalProgress> progress = goalService.computeProgressForUser(DEFAULT_USER_ID);
        return goalService.getChildren(id).stream()
            .map(g -> toResponse(g, progress))
            .toList();
    }

    @GetMapping("/{id}/tasks")
    public List<TaskResponse> getLinkedTasks(@PathVariable Long id) {
        goalService.getGoal(id);
        return goalService.getLinkedTasks(id).stream()
            .map(TaskResponse::from)
            .toList();
    }

    @PostMapping
    public GoalResponse createGoal(@Valid @RequestBody GoalRequest req) {
        Goal goal = Goal.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .goalType(req.getGoalType())
            .targetDate(req.getTargetDate())
            .build();
        Goal saved = goalService.createGoal(DEFAULT_USER_ID, goal, req.getParentId());
        return GoalResponse.from(saved, 0, 0, 0);
    }

    @PutMapping("/{id}")
    public GoalResponse updateGoal(@PathVariable Long id, @Valid @RequestBody GoalRequest req) {
        Goal goal = Goal.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .goalType(req.getGoalType())
            .targetDate(req.getTargetDate())
            .build();
        Goal saved = goalService.updateGoal(id, goal, req.getParentId());
        Map<Long, GoalService.GoalProgress> progress = goalService.computeProgressForUser(DEFAULT_USER_ID);
        return toResponse(saved, progress);
    }

    @PatchMapping("/{id}/status")
    public GoalResponse updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        GoalStatus status = GoalStatus.valueOf(body.get("status"));
        Goal saved = goalService.updateStatus(id, status);
        Map<Long, GoalService.GoalProgress> progress = goalService.computeProgressForUser(DEFAULT_USER_ID);
        return toResponse(saved, progress);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    private GoalResponse toResponse(Goal goal, Map<Long, GoalService.GoalProgress> progressMap) {
        GoalService.GoalProgress p = progressMap.getOrDefault(goal.getId(), GoalService.GoalProgress.ZERO);
        return GoalResponse.from(goal, p.progress(), p.linkedTaskCount(), p.completedTaskCount());
    }
}
