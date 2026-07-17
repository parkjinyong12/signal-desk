package com.signaldesk.api.controller;

import com.signaldesk.application.service.TelegramNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final TelegramNotificationService telegramNotificationService;

    @PostMapping("/telegram/test")
    public void sendTelegramTest() {
        telegramNotificationService.sendMorningNotification();
    }
}
