package com.signaldesk.domain.service;

import com.signaldesk.application.service.PriorityCalculationService;
import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.User;
import com.signaldesk.domain.entity.enums.TaskStatus;
import com.signaldesk.domain.repository.TaskRepository;
import com.signaldesk.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
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
    public Task createTask(Long userId, Task task) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        task.setUser(user);
        priorityCalculationService.calculate(task);
        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(Long id, Task updated) {
        Task task = getTask(id);
        task.setTitle(updated.getTitle());
        task.setDescription(updated.getDescription());
        task.setCategory(updated.getCategory());
        task.setDeadline(updated.getDeadline());
        task.setEstimatedMinutes(updated.getEstimatedMinutes());
        task.setImportanceScore(updated.getImportanceScore());
        task.setUrgencyScore(updated.getUrgencyScore());
        task.setEnergyLevel(updated.getEnergyLevel());
        priorityCalculationService.calculate(task);
        return taskRepository.save(task);
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
