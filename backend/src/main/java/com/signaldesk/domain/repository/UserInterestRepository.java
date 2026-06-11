package com.signaldesk.domain.repository;

import com.signaldesk.domain.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {
    List<UserInterest> findByUserId(Long userId);
    List<UserInterest> findByUserIdAndEnabledTrue(Long userId);
}
