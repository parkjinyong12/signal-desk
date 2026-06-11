package com.signaldesk.api.controller;

import com.signaldesk.api.dto.TaskRequest;
import com.signaldesk.api.dto.TaskResponse;
import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.enums.EnergyLevel;
import com.signaldesk.domain.entity.enums.TaskStatus;
import com.signaldesk.domain.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping
    public List<TaskResponse> getTasks() {
        return taskService.getActiveTasks(DEFAULT_USER_ID).stream()
            .map(TaskResponse::from).toList();
    }

    @GetMapping("/{id}")
    public TaskResponse getTask(@PathVariable Long id) {
        return TaskResponse.from(taskService.getTask(id));
    }

    @PostMapping
    public TaskResponse createTask(@Valid @RequestBody TaskRequest req) {
        Task task = Task.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .category(req.getCategory())
            .deadline(req.getDeadline())
            .estimatedMinutes(req.getEstimatedMinutes())
            .importanceScore(req.getImportanceScore())
            .urgencyScore(req.getUrgencyScore())
            .energyLevel(req.getEnergyLevel() != null ? req.getEnergyLevel() : EnergyLevel.MEDIUM)
            .build();
        return TaskResponse.from(taskService.createTask(DEFAULT_USER_ID, task));
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest req) {
        Task task = Task.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .category(req.getCategory())
            .deadline(req.getDeadline())
            .estimatedMinutes(req.getEstimatedMinutes())
            .importanceScore(req.getImportanceScore())
            .urgencyScore(req.getUrgencyScore())
            .energyLevel(req.getEnergyLevel() != null ? req.getEnergyLevel() : EnergyLevel.MEDIUM)
            .build();
        return TaskResponse.from(taskService.updateTask(id, task));
    }

    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TaskStatus status = TaskStatus.valueOf(body.get("status"));
        return TaskResponse.from(taskService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
