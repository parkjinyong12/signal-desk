package com.signaldesk.domain.service;

import com.signaldesk.domain.entity.Goal;
import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.User;
import com.signaldesk.domain.entity.enums.GoalStatus;
import com.signaldesk.domain.entity.enums.GoalType;
import com.signaldesk.domain.entity.enums.TaskStatus;
import com.signaldesk.domain.repository.GoalRepository;
import com.signaldesk.domain.repository.TaskRepository;
import com.signaldesk.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GoalService {

    public record GoalProgress(int progress, long linkedTaskCount, long completedTaskCount) {
        public static final GoalProgress ZERO = new GoalProgress(0, 0, 0);
    }

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

    public List<Goal> getChildren(Long goalId) {
        return goalRepository.findByParentIdOrderByCreatedAtAsc(goalId);
    }

    public List<Task> getLinkedTasks(Long goalId) {
        return taskRepository.findByGoals_Id(goalId);
    }

    /**
     * Bottom-up rollup over the user's whole goal tree in 3 queries total.
     * A goal with children averages [each non-ARCHIVED child's rolled-up progress]
     * plus [its own direct-task progress, only if it has ≥1 linked task]. COMPLETED
     * forces 100 regardless of the computed value.
     */
    public Map<Long, GoalProgress> computeProgressForUser(Long userId) {
        List<Goal> allGoals = goalRepository.findByUserId(userId);

        Map<Long, Long> linkedCounts = new HashMap<>();
        for (Object[] row : taskRepository.countLinkedGroupedByUser(userId)) {
            linkedCounts.put((Long) row[0], (Long) row[1]);
        }
        Map<Long, Long> completedCounts = new HashMap<>();
        for (Object[] row : taskRepository.countByStatusGroupedByUser(userId, TaskStatus.DONE)) {
            completedCounts.put((Long) row[0], (Long) row[1]);
        }

        Map<Long, List<Goal>> childrenByParentId = new HashMap<>();
        for (Goal g : allGoals) {
            if (g.getParent() != null) {
                childrenByParentId.computeIfAbsent(g.getParent().getId(), k -> new ArrayList<>()).add(g);
            }
        }

        Map<Long, GoalProgress> memo = new HashMap<>();
        for (Goal g : allGoals) {
            computeProgress(g, childrenByParentId, linkedCounts, completedCounts, memo);
        }
        return memo;
    }

    private GoalProgress computeProgress(
        Goal goal,
        Map<Long, List<Goal>> childrenByParentId,
        Map<Long, Long> linkedCounts,
        Map<Long, Long> completedCounts,
        Map<Long, GoalProgress> memo
    ) {
        GoalProgress cached = memo.get(goal.getId());
        if (cached != null) return cached;

        long linkedCount = linkedCounts.getOrDefault(goal.getId(), 0L);
        long completedCount = completedCounts.getOrDefault(goal.getId(), 0L);

        List<Integer> contributions = new ArrayList<>();
        for (Goal child : childrenByParentId.getOrDefault(goal.getId(), List.of())) {
            if (child.getStatus() == GoalStatus.ARCHIVED) continue;
            contributions.add(computeProgress(child, childrenByParentId, linkedCounts, completedCounts, memo).progress());
        }
        if (linkedCount > 0) {
            contributions.add((int) Math.round(100.0 * completedCount / linkedCount));
        }

        int progress;
        if (goal.getStatus() == GoalStatus.COMPLETED) {
            progress = 100;
        } else if (contributions.isEmpty()) {
            progress = 0;
        } else {
            progress = (int) Math.round(contributions.stream().mapToInt(Integer::intValue).average().orElse(0));
        }

        GoalProgress result = new GoalProgress(progress, linkedCount, completedCount);
        memo.put(goal.getId(), result);
        return result;
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
    public Goal updateStatus(Long id, GoalStatus status) {
        Goal goal = getGoal(id);
        goal.setStatus(status);
        return goalRepository.save(goal);
    }

    @Transactional
    public void deleteGoal(Long id) {
        Goal goal = getGoal(id);
        if (goalRepository.existsByParentId(id)) {
            throw new RuntimeException("Cannot delete goal with sub-goals, reassign or delete children first: " + id);
        }
        List<Task> linkedTasks = getLinkedTasks(id);
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
