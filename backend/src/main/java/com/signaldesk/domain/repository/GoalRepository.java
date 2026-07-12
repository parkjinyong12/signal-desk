package com.signaldesk.domain.repository;

import com.signaldesk.domain.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserId(Long userId);
    boolean existsByParentId(Long parentId);
}
