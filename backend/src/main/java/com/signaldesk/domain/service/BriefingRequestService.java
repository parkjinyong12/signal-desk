package com.signaldesk.domain.service;

import com.signaldesk.domain.entity.BriefingRequest;
import com.signaldesk.domain.entity.User;
import com.signaldesk.domain.repository.BriefingRequestRepository;
import com.signaldesk.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BriefingRequestService {

    private final BriefingRequestRepository requestRepository;
    private final UserRepository userRepository;

    public List<BriefingRequest> getTomorrowRequests(Long userId) {
        return requestRepository.findByUserIdAndTargetDate(userId, LocalDate.now().plusDays(1));
    }

    public List<BriefingRequest> getTodayRequests(Long userId) {
        return requestRepository.findByUserIdAndTargetDate(userId, LocalDate.now());
    }

    public List<BriefingRequest> getUnprocessedRequests(Long userId, LocalDate date) {
        return requestRepository.findByUserIdAndTargetDateAndProcessedFalse(userId, date);
    }

    @Transactional
    public BriefingRequest addRequest(Long userId, String content, LocalDate targetDate) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        return requestRepository.save(BriefingRequest.builder()
            .user(user)
            .content(content)
            .targetDate(targetDate)
            .processed(false)
            .build());
    }

    @Transactional
    public void deleteRequest(Long id) {
        requestRepository.deleteById(id);
    }

    @Transactional
    public void markProcessed(Long id) {
        requestRepository.findById(id).ifPresent(r -> {
            r.setProcessed(true);
            requestRepository.save(r);
        });
    }
}
