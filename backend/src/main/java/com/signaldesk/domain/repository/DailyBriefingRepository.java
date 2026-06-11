package com.signaldesk.domain.repository;

import com.signaldesk.domain.entity.DailyBriefing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyBriefingRepository extends JpaRepository<DailyBriefing, Long> {
    Optional<DailyBriefing> findByUserIdAndBriefingDate(Long userId, LocalDate date);
}
