package com.signaldesk.infrastructure;

import com.signaldesk.application.service.NewsScoreService;
import com.signaldesk.application.service.RssCollectionService;
import com.signaldesk.application.service.TelegramNotificationService;
import com.signaldesk.domain.entity.NewsArticle;
import com.signaldesk.domain.entity.UserInterest;
import com.signaldesk.domain.repository.NewsArticleRepository;
import com.signaldesk.domain.repository.UserInterestRepository;
import com.signaldesk.domain.service.BriefingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MorningBriefingScheduler {

    private static final Long DEFAULT_USER_ID = 1L;

    private final RssCollectionService rssCollectionService;
    private final NewsArticleRepository newsArticleRepository;
    private final UserInterestRepository interestRepository;
    private final NewsScoreService newsScoreService;
    private final BriefingService briefingService;
    private final TelegramNotificationService telegramNotificationService;

    // 매일 06:50 — RSS 뉴스 수집
    @Scheduled(cron = "0 50 6 * * *", zone = "Asia/Seoul")
    public void collectNews() {
        log.info("[스케줄러] 06:50 뉴스 수집 시작");
        try {
            rssCollectionService.collectAll();
            log.info("[스케줄러] 뉴스 수집 완료");
        } catch (Exception e) {
            log.error("[스케줄러] 뉴스 수집 실패", e);
        }
    }

    // 매일 07:00 — 키워드 점수 계산 + 요약
    @Scheduled(cron = "0 0 7 * * *", zone = "Asia/Seoul")
    public void scoreNews() {
        log.info("[스케줄러] 07:00 뉴스 점수 계산 시작");
        try {
            List<UserInterest> interests = interestRepository.findByUserIdAndEnabledTrue(DEFAULT_USER_ID);
            List<NewsArticle> articles = newsArticleRepository
                .findRecentNews(java.time.LocalDateTime.now().minusHours(24));

            for (NewsArticle article : articles) {
                int score = newsScoreService.calculateScore(article, interests);
                article.setImportanceScore(score);
            }
            newsArticleRepository.saveAll(articles);
            log.info("[스케줄러] 뉴스 점수 계산 완료: {}건", articles.size());
        } catch (Exception e) {
            log.error("[스케줄러] 뉴스 점수 계산 실패", e);
        }
    }

    // 매일 07:05 — 브리핑 생성
    @Scheduled(cron = "0 5 7 * * *", zone = "Asia/Seoul")
    public void generateBriefing() {
        log.info("[스케줄러] 07:05 브리핑 생성 시작");
        try {
            briefingService.generateBriefing(DEFAULT_USER_ID);
            log.info("[스케줄러] 07:05 브리핑 생성 완료 — 07:10 확인 가능");
        } catch (Exception e) {
            log.error("[스케줄러] 브리핑 생성 실패", e);
            return;
        }

        try {
            telegramNotificationService.sendMorningNotification();
        } catch (Exception e) {
            log.error("[스케줄러] 텔레그램 알림 전송 실패", e);
        }
    }
}
