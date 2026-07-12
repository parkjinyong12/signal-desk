package com.signaldesk.domain.service;

import com.signaldesk.application.service.PriorityCalculationService;
import com.signaldesk.domain.entity.Goal;
import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.User;
import com.signaldesk.domain.entity.enums.TaskStatus;
import com.signaldesk.domain.repository.GoalRepository;
import com.signaldesk.domain.repository.TaskRepository;
import com.signaldesk.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final PriorityCalculationService priorityCalculationService;

    public List<Task> getActiveTasks(Long userId) {
        return taskRepository.findActiveTasks(userId);
    }

    public List<Task> getAllTasks(Long userId) {
        return taskRepository.findByUserIdOrderByPriorityScoreDesc(userId);
    }

    public Task getTask(Long id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found: " + id));
    }

    @Transactional
    public Task createTask(Long userId, Task task, List<Long> goalIds) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        task.setUser(user);
        task.setGoals(resolveGoals(goalIds));
        priorityCalculationService.calculate(task);
        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(Long id, Task updated, List<Long> goalIds) {
        Task task = getTask(id);
        task.setTitle(updated.getTitle());
        task.setDescription(updated.getDescription());
        task.setCategory(updated.getCategory());
        task.setDeadline(updated.getDeadline());
        task.setEstimatedMinutes(updated.getEstimatedMinutes());
        task.setImportanceScore(updated.getImportanceScore());
        task.setUrgencyScore(updated.getUrgencyScore());
        task.setEnergyLevel(updated.getEnergyLevel());
        task.setGoals(resolveGoals(goalIds));
        priorityCalculationService.calculate(task);
        return taskRepository.save(task);
    }

    private Set<Goal> resolveGoals(List<Long> goalIds) {
        if (goalIds == null || goalIds.isEmpty()) return new HashSet<>();
        return new HashSet<>(goalRepository.findAllById(goalIds));
    }

    @Transactional
    public Task updateStatus(Long id, TaskStatus status) {
        Task task = getTask(id);
        task.setStatus(status);
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    @Transactional
    public void recalculateAll(Long userId) {
        List<Task> tasks = taskRepository.findActiveTasks(userId);
        tasks.forEach(priorityCalculationService::calculate);
        taskRepository.saveAll(tasks);
    }
}
