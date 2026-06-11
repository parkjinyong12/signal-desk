package com.signaldesk.domain.service;

import com.signaldesk.domain.entity.User;
import com.signaldesk.domain.entity.UserInterest;
import com.signaldesk.domain.repository.UserInterestRepository;
import com.signaldesk.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterestService {

    private final UserInterestRepository interestRepository;
    private final UserRepository userRepository;

    public List<UserInterest> getInterests(Long userId) {
        return interestRepository.findByUserId(userId);
    }

    public List<UserInterest> getEnabledInterests(Long userId) {
        return interestRepository.findByUserIdAndEnabledTrue(userId);
    }

    @Transactional
    public UserInterest createInterest(Long userId, UserInterest interest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        interest.setUser(user);
        return interestRepository.save(interest);
    }

    @Transactional
    public UserInterest updateInterest(Long id, UserInterest updated) {
        UserInterest interest = interestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Interest not found: " + id));
        interest.setCategory(updated.getCategory());
        interest.setKeyword(updated.getKeyword());
        interest.setWeight(updated.getWeight());
        interest.setEnabled(updated.getEnabled());
        return interestRepository.save(interest);
    }

    @Transactional
    public void deleteInterest(Long id) {
        interestRepository.deleteById(id);
    }
}
