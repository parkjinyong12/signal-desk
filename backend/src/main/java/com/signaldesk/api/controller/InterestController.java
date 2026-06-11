package com.signaldesk.api.controller;

import com.signaldesk.api.dto.InterestRequest;
import com.signaldesk.domain.entity.UserInterest;
import com.signaldesk.domain.service.InterestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InterestController {

    private final InterestService interestService;
    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping
    public List<UserInterest> getInterests() {
        return interestService.getInterests(DEFAULT_USER_ID);
    }

    @PostMapping
    public UserInterest createInterest(@Valid @RequestBody InterestRequest req) {
        UserInterest interest = UserInterest.builder()
            .category(req.getCategory())
            .keyword(req.getKeyword())
            .weight(req.getWeight())
            .enabled(req.getEnabled())
            .build();
        return interestService.createInterest(DEFAULT_USER_ID, interest);
    }

    @PutMapping("/{id}")
    public UserInterest updateInterest(@PathVariable Long id, @Valid @RequestBody InterestRequest req) {
        UserInterest interest = UserInterest.builder()
            .category(req.getCategory())
            .keyword(req.getKeyword())
            .weight(req.getWeight())
            .enabled(req.getEnabled())
            .build();
        return interestService.updateInterest(id, interest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterest(@PathVariable Long id) {
        interestService.deleteInterest(id);
        return ResponseEntity.noContent().build();
    }
}
