package com.signaldesk.application.service;

import com.signaldesk.domain.entity.NewsArticle;
import com.signaldesk.domain.entity.UserInterest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class NewsScoreService {

    public int calculateScore(NewsArticle article, List<UserInterest> interests) {
        int score = 0;
        score += keywordMatchScore(article, interests);
        score += recencyScore(article.getPublishedAt());
        score += categoryWeightScore(article, interests);
        return Math.max(0, score);
    }

    private int keywordMatchScore(NewsArticle article, List<UserInterest> interests) {
        int score = 0;
        String title = article.getTitle() != null ? article.getTitle().toLowerCase() : "";
        String content = article.getContent() != null ? article.getContent().toLowerCase() : "";

        for (UserInterest interest : interests) {
            if (!Boolean.TRUE.equals(interest.getEnabled())) continue;
            String kw = interest.getKeyword().toLowerCase();
            if (title.contains(kw)) {
                score += 30;
            } else if (content.contains(kw)) {
                score += 15;
            }
        }
        return score;
    }

    private int recencyScore(LocalDateTime publishedAt) {
        if (publishedAt == null) return 0;
        long hours = ChronoUnit.HOURS.between(publishedAt, LocalDateTime.now());
        if (hours <= 24) return 20;
        if (hours <= 72) return 10;
        if (hours <= 168) return 5;
        return 0;
    }

    private int categoryWeightScore(NewsArticle article, List<UserInterest> interests) {
        if (article.getCategory() == null) return 0;
        return interests.stream()
            .filter(i -> Boolean.TRUE.equals(i.getEnabled()))
            .filter(i -> article.getCategory().equalsIgnoreCase(i.getCategory()))
            .mapToInt(i -> i.getWeight() != null ? i.getWeight() * 5 : 0)
            .max()
            .orElse(0);
    }
}
