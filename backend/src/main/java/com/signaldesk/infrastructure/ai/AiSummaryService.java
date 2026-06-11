package com.signaldesk.infrastructure.ai;

import com.signaldesk.domain.entity.NewsArticle;
import com.signaldesk.domain.entity.Task;

import java.util.List;

public interface AiSummaryService {

    NewsArticle summarizeNews(NewsArticle article);

    String generateDailySummary(List<Task> mustDoTasks, List<NewsArticle> topNews);

    List<String> generateJudgementPoints(List<Task> tasks, List<NewsArticle> news);
}
