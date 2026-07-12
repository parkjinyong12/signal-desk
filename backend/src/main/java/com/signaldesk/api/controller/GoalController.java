package com.signaldesk.api.controller;

import com.signaldesk.api.dto.GoalRequest;
import com.signaldesk.api.dto.GoalResponse;
import com.signaldesk.domain.entity.Goal;
import com.signaldesk.domain.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GoalController {

    private final GoalService goalService;

    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping
    public List<GoalResponse> getGoals() {
        return goalService.getAllGoals(DEFAULT_USER_ID).stream()
            .map(g -> GoalResponse.from(g,
                goalService.countLinkedTasks(g.getId()),
                goalService.countCompletedTasks(g.getId())))
            .toList();
    }

    @GetMapping("/{id}")
    public GoalResponse getGoal(@PathVariable Long id) {
        Goal goal = goalService.getGoal(id);
        return GoalResponse.from(goal,
            goalService.countLinkedTasks(id), goalService.countCompletedTasks(id));
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
        return GoalResponse.from(saved, 0, 0);
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
        return GoalResponse.from(saved,
            goalService.countLinkedTasks(id), goalService.countCompletedTasks(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
