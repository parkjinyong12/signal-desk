package com.signaldesk.domain.service;

import com.signaldesk.domain.entity.Goal;
import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.User;
import com.signaldesk.domain.entity.enums.GoalType;
import com.signaldesk.domain.entity.enums.TaskStatus;
import com.signaldesk.domain.repository.GoalRepository;
import com.signaldesk.domain.repository.TaskRepository;
import com.signaldesk.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public List<Goal> getAllGoals(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    public Goal getGoal(Long id) {
        return goalRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Goal not found: " + id));
    }

    public long countLinkedTasks(Long goalId) {
        return taskRepository.countByGoals_Id(goalId);
    }

    public long countCompletedTasks(Long goalId) {
        return taskRepository.countByGoals_IdAndStatus(goalId, TaskStatus.DONE);
    }

    @Transactional
    public Goal createGoal(Long userId, Goal goal, Long parentId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        goal.setUser(user);
        goal.setParent(resolveAndValidateParent(goal.getGoalType(), parentId));
        return goalRepository.save(goal);
    }

    @Transactional
    public Goal updateGoal(Long id, Goal updated, Long parentId) {
        Goal goal = getGoal(id);
        if (updated.getGoalType() != goal.getGoalType() && goalRepository.existsByParentId(id)) {
            throw new RuntimeException("Cannot change goal type while it has sub-goals: " + id);
        }
        goal.setTitle(updated.getTitle());
        goal.setDescription(updated.getDescription());
        goal.setGoalType(updated.getGoalType());
        goal.setTargetDate(updated.getTargetDate());
        goal.setParent(resolveAndValidateParent(updated.getGoalType(), parentId));
        return goalRepository.save(goal);
    }

    @Transactional
    public void deleteGoal(Long id) {
        Goal goal = getGoal(id);
        if (goalRepository.existsByParentId(id)) {
            throw new RuntimeException("Cannot delete goal with sub-goals, reassign or delete children first: " + id);
        }
        List<Task> linkedTasks = taskRepository.findByGoals_Id(id);
        linkedTasks.forEach(t -> t.getGoals().remove(goal));
        taskRepository.saveAll(linkedTasks);
        goalRepository.delete(goal);
    }

    private Goal resolveAndValidateParent(GoalType type, Long parentId) {
        if (type == GoalType.LIFE) {
            if (parentId != null) {
                throw new RuntimeException("LIFE goals cannot have a parent");
            }
            return null;
        }
        if (parentId == null) {
            throw new RuntimeException(type + " goal requires a parent goal");
        }
        Goal parent = goalRepository.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent goal not found: " + parentId));
        GoalType expected = GoalType.values()[type.ordinal() - 1];
        if (parent.getGoalType() != expected) {
            throw new RuntimeException(
                "Parent of a " + type + " goal must be " + expected + ", but was " + parent.getGoalType());
        }
        return parent;
    }
}
