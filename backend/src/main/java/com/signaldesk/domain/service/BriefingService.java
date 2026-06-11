package com.signaldesk.domain.service;

import com.signaldesk.application.service.ScheduleRecommendationService;
import com.signaldesk.domain.entity.*;
import com.signaldesk.domain.entity.enums.ItemType;
import com.signaldesk.domain.entity.enums.PriorityLevel;
import com.signaldesk.domain.repository.BriefingRequestRepository;
import com.signaldesk.domain.repository.DailyBriefingRepository;
import com.signaldesk.domain.repository.TaskRepository;
import com.signaldesk.domain.repository.UserInterestRepository;
import com.signaldesk.domain.repository.UserRepository;
import com.signaldesk.infrastructure.ai.AiSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BriefingService {

    private final DailyBriefingRepository briefingRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final UserInterestRepository interestRepository;
    private final BriefingRequestRepository briefingRequestRepository;
    private final NewsService newsService;
    private final ScheduleRecommendationService scheduleService;
    private final AiSummaryService aiSummaryService;

    public DailyBriefing getTodayBriefing(Long userId) {
        return briefingRepository.findByUserIdAndBriefingDate(userId, LocalDate.now())
            .orElse(null);
    }

    public DailyBriefing getBriefingByDate(Long userId, LocalDate date) {
        return briefingRepository.findByUserIdAndBriefingDate(userId, date)
            .orElse(null);
    }

    @Transactional
    public DailyBriefing generateBriefing(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        DailyBriefing briefing = briefingRepository.findByUserIdAndBriefingDate(userId, LocalDate.now())
            .orElse(DailyBriefing.builder()
                .user(user)
                .briefingDate(LocalDate.now())
                .build());

        briefing.getItems().clear();
        briefing.getPlanBlocks().clear();

        List<Task> activeTasks = taskRepository.findActiveTasks(userId);
        List<Task> mustDoTasks = activeTasks.stream()
            .filter(t -> PriorityLevel.A_MUST_DO_TODAY.equals(t.getPriorityLevel()))
            .toList();
        List<Task> shouldDoTasks = activeTasks.stream()
            .filter(t -> PriorityLevel.B_SHOULD_DO_TODAY.equals(t.getPriorityLevel()))
            .toList();

        List<NewsArticle> topNews = newsService.getTodayNews().stream()
            .sorted((a, b) -> Integer.compare(b.getImportanceScore(), a.getImportanceScore()))
            .limit(5)
            .toList();

        String summary = aiSummaryService.generateDailySummary(mustDoTasks, topNews);
        List<String> judgements = aiSummaryService.generateJudgementPoints(activeTasks, topNews);

        briefing.setSummary(summary);
        briefing.setMustDoCount(mustDoTasks.size());
        briefing.setTotalTaskCount(activeTasks.size());
        briefing.setGeneratedAt(LocalDateTime.now());

        List<DailyBriefingItem> items = new ArrayList<>();
        for (Task task : mustDoTasks) {
            items.add(DailyBriefingItem.builder()
                .dailyBriefing(briefing)
                .itemType(ItemType.TASK)
                .title(task.getTitle())
                .summary(task.getDescription())
                .reason(task.getReason())
                .score(task.getPriorityScore())
                .relatedTaskId(task.getId())
                .build());
        }
        for (NewsArticle news : topNews) {
            items.add(DailyBriefingItem.builder()
                .dailyBriefing(briefing)
                .itemType(ItemType.NEWS)
                .title(news.getTitle())
                .summary(news.getSummary())
                .reason(news.getWhyItMatters())
                .recommendedAction(news.getRecommendedAction())
                .score(news.getImportanceScore())
                .relatedNewsId(news.getId())
                .build());
        }
        for (String point : judgements) {
            items.add(DailyBriefingItem.builder()
                .dailyBriefing(briefing)
                .itemType(ItemType.JUDGEMENT)
                .title(point)
                .build());
        }

        // 전날 추가 요청 항목 포함
        List<BriefingRequest> requests = briefingRequestRepository
            .findByUserIdAndTargetDateAndProcessedFalse(userId, LocalDate.now());
        for (BriefingRequest req : requests) {
            items.add(DailyBriefingItem.builder()
                .dailyBriefing(briefing)
                .itemType(ItemType.REMINDER)
                .title("[추가 요청] " + req.getContent())
                .summary("사용자 직접 요청 항목")
                .build());
            req.setProcessed(true);
        }
        briefingRequestRepository.saveAll(requests);

        briefing.setItems(items);

        List<Task> tasksToSchedule = new ArrayList<>(mustDoTasks);
        tasksToSchedule.addAll(shouldDoTasks);
        List<DailyPlanBlock> planBlocks = scheduleService.generatePlan(briefing, tasksToSchedule);
        briefing.setPlanBlocks(planBlocks);

        return briefingRepository.save(briefing);
    }
}
