package com.signaldesk.domain.repository;

import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.enums.PriorityLevel;
import com.signaldesk.domain.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByPriorityScoreDesc(Long userId);
    List<Task> findByUserIdAndStatusNotOrderByPriorityScoreDesc(Long userId, TaskStatus status);
    List<Task> findByUserIdAndPriorityLevel(Long userId, PriorityLevel priorityLevel);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.status NOT IN ('DONE','CANCELLED') ORDER BY t.priorityScore DESC")
    List<Task> findActiveTasks(Long userId);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.deadline BETWEEN :start AND :end AND t.status NOT IN ('DONE','CANCELLED')")
    List<Task> findTasksDueToday(Long userId, LocalDateTime start, LocalDateTime end);

    long countByGoals_Id(Long goalId);
    long countByGoals_IdAndStatus(Long goalId, TaskStatus status);
    List<Task> findByGoals_Id(Long goalId);
}
