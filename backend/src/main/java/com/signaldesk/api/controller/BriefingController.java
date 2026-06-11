package com.signaldesk.api.controller;

import com.signaldesk.domain.entity.DailyBriefing;
import com.signaldesk.domain.service.BriefingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/briefings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BriefingController {

    private final BriefingService briefingService;
    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping("/today")
    public DailyBriefing getTodayBriefing() {
        return briefingService.getTodayBriefing(DEFAULT_USER_ID);
    }

    @PostMapping("/generate")
    public DailyBriefing generateBriefing() {
        return briefingService.generateBriefing(DEFAULT_USER_ID);
    }

    @GetMapping("/{date}")
    public DailyBriefing getBriefingByDate(
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return briefingService.getBriefingByDate(DEFAULT_USER_ID, date);
    }
}
