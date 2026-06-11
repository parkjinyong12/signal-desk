package com.signaldesk.domain.repository;

import com.signaldesk.domain.entity.BriefingRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BriefingRequestRepository extends JpaRepository<BriefingRequest, Long> {
    List<BriefingRequest> findByUserIdAndTargetDate(Long userId, LocalDate date);
    List<BriefingRequest> findByUserIdAndTargetDateAndProcessedFalse(Long userId, LocalDate date);
}
