package com.signaldesk.api.controller;

import com.signaldesk.api.dto.NewsRequest;
import com.signaldesk.domain.entity.NewsArticle;
import com.signaldesk.domain.entity.UserInterest;
import com.signaldesk.domain.service.InterestService;
import com.signaldesk.domain.service.NewsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NewsController {

    private final NewsService newsService;
    private final InterestService interestService;
    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping
    public List<NewsArticle> getAllNews() {
        return newsService.getAllNews();
    }

    @GetMapping("/today")
    public List<NewsArticle> getTodayNews() {
        return newsService.getTodayNews();
    }

    @PostMapping
    public NewsArticle createArticle(@Valid @RequestBody NewsRequest req) {
        NewsArticle article = NewsArticle.builder()
            .title(req.getTitle())
            .source(req.getSource())
            .url(req.getUrl())
            .publishedAt(req.getPublishedAt() != null ? req.getPublishedAt() : LocalDateTime.now())
            .content(req.getContent())
            .category(req.getCategory())
            .build();
        return newsService.createArticle(article);
    }

    @PostMapping("/summarize")
    public List<NewsArticle> summarizeNews() {
        List<UserInterest> interests = interestService.getEnabledInterests(DEFAULT_USER_ID);
        return newsService.scoreAndSummarize(interests);
    }
}
