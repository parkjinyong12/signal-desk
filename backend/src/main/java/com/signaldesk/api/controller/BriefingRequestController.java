package com.signaldesk.api.controller;

import com.signaldesk.domain.entity.BriefingRequest;
import com.signaldesk.domain.service.BriefingRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/briefing-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BriefingRequestController {

    private final BriefingRequestService requestService;
    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping("/tomorrow")
    public List<BriefingRequest> getTomorrow() {
        return requestService.getTomorrowRequests(DEFAULT_USER_ID);
    }

    @GetMapping("/today")
    public List<BriefingRequest> getToday() {
        return requestService.getTodayRequests(DEFAULT_USER_ID);
    }

    @PostMapping
    public BriefingRequest create(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        String dateStr = body.get("targetDate");
        LocalDate targetDate = dateStr != null
            ? LocalDate.parse(dateStr)
            : LocalDate.now().plusDays(1);

        return requestService.addRequest(DEFAULT_USER_ID, content, targetDate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        requestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
