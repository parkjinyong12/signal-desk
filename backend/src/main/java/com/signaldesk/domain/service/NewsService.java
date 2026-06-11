package com.signaldesk.domain.service;

import com.signaldesk.application.service.NewsScoreService;
import com.signaldesk.domain.entity.NewsArticle;
import com.signaldesk.domain.entity.UserInterest;
import com.signaldesk.domain.repository.NewsArticleRepository;
import com.signaldesk.infrastructure.ai.AiSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsService {

    private final NewsArticleRepository newsRepository;
    private final NewsScoreService newsScoreService;
    private final AiSummaryService aiSummaryService;

    public List<NewsArticle> getTodayNews() {
        return newsRepository.findRecentNews(LocalDateTime.now().minusHours(24));
    }

    public List<NewsArticle> getAllNews() {
        return newsRepository.findAll();
    }

    @Transactional
    public NewsArticle saveArticle(NewsArticle article) {
        return newsRepository.findByUrl(article.getUrl())
            .orElseGet(() -> newsRepository.save(article));
    }

    @Transactional
    public List<NewsArticle> scoreAndSummarize(List<UserInterest> interests) {
        List<NewsArticle> articles = newsRepository.findRecentNews(LocalDateTime.now().minusHours(48));
        for (NewsArticle article : articles) {
            int score = newsScoreService.calculateScore(article, interests);
            article.setImportanceScore(score);
            aiSummaryService.summarizeNews(article);
        }
        return newsRepository.saveAll(articles);
    }

    @Transactional
    public NewsArticle createArticle(NewsArticle article) {
        return newsRepository.save(article);
    }
}
