package com.signaldesk.application.service;

import com.signaldesk.domain.entity.Goal;
import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.enums.GoalStatus;
import com.signaldesk.domain.entity.enums.GoalType;
import com.signaldesk.domain.entity.enums.PriorityLevel;
import com.signaldesk.domain.repository.GoalRepository;
import com.signaldesk.domain.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramNotificationService {

    private static final Long DEFAULT_USER_ID = 1L;
    private static final RestTemplate restTemplate = new RestTemplate();

    private static final Map<GoalType, String> GOAL_TYPE_LABELS = new EnumMap<>(GoalType.class);
    static {
        GOAL_TYPE_LABELS.put(GoalType.LIFE, "인생");
        GOAL_TYPE_LABELS.put(GoalType.MID_TERM, "중장기");
        GOAL_TYPE_LABELS.put(GoalType.YEARLY, "연간");
        GOAL_TYPE_LABELS.put(GoalType.QUARTERLY, "분기");
        GOAL_TYPE_LABELS.put(GoalType.MONTHLY, "월간");
        GOAL_TYPE_LABELS.put(GoalType.WEEKLY, "주간");
    }

    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;

    @Value("${telegram.bot-token}")
    private String botToken;

    @Value("${telegram.chat-id}")
    private String chatId;

    public void sendMorningNotification() {
        send(buildMessage(DEFAULT_USER_ID));
    }

    private String buildMessage(Long userId) {
        LocalDate today = LocalDate.now();
        String dateLine = today.format(DateTimeFormatter.ofPattern("yyyy년 M월 d일"))
            + " (" + today.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.KOREAN) + ")";

        StringBuilder sb = new StringBuilder();
        sb.append("☀️ <b>오늘의 시그널 데스크</b>\n");
        sb.append(dateLine).append("\n\n");

        List<Task> mustDoTasks = taskRepository.findActiveTasks(userId).stream()
            .filter(t -> t.getPriorityLevel() == PriorityLevel.A_MUST_DO_TODAY)
            .toList();

        sb.append("📌 <b>반드시 처리할 일</b> (").append(mustDoTasks.size()).append(")\n");
        if (mustDoTasks.isEmpty()) {
            sb.append("˙ᵕ˙ 오늘은 없어요\n");
        } else {
            for (Task task : mustDoTasks) {
                sb.append("☑️ ").append(escapeHtml(task.getTitle())).append("\n");
            }
        }

        sb.append("\n");

        List<Goal> upcomingGoals = goalRepository.findByUserId(userId).stream()
            .filter(g -> g.getStatus() == GoalStatus.ACTIVE && g.getTargetDate() != null)
            .filter(g -> daysUntil(g.getTargetDate()) <= 30)
            .sorted(Comparator.comparingLong(g -> daysUntil(g.getTargetDate())))
            .toList();

        sb.append("🎯 <b>이번 달 목표</b> (").append(upcomingGoals.size()).append(")\n");
        if (upcomingGoals.isEmpty()) {
            sb.append("˙ᵕ˙ 임박한 목표가 없어요\n");
        } else {
            Map<GoalType, List<Goal>> byType = upcomingGoals.stream()
                .collect(Collectors.groupingBy(Goal::getGoalType, LinkedHashMap::new, Collectors.toList()));

            for (Map.Entry<GoalType, List<Goal>> entry : byType.entrySet()) {
                sb.append("<b>[").append(GOAL_TYPE_LABELS.get(entry.getKey())).append("]</b>\n");
                for (Goal goal : entry.getValue()) {
                    long days = daysUntil(goal.getTargetDate());
                    sb.append(urgencyDot(days)).append(" ")
                        .append(escapeHtml(goal.getTitle()))
                        .append("  <b>").append(ddayLabel(days)).append("</b>")
                        .append("\n");
                }
            }
        }

        return sb.toString();
    }

    private long daysUntil(LocalDate targetDate) {
        return ChronoUnit.DAYS.between(LocalDate.now(), targetDate);
    }

    private String ddayLabel(long days) {
        if (days < 0) return "D+" + (-days);
        if (days == 0) return "D-Day";
        return "D-" + days;
    }

    private String urgencyDot(long days) {
        if (days < 0) return "🔴";
        if (days <= 7) return "🟠";
        return "🟡";
    }

    private String escapeHtml(String text) {
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private void send(String text) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", text);
            body.put("parse_mode", "HTML");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            restTemplate.postForEntity(url, new HttpEntity<>(body, headers), String.class);
            log.info("[텔레그램] 아침 알림 전송 완료");
        } catch (Exception e) {
            log.error("[텔레그램] 알림 전송 실패", e);
        }
    }
}
