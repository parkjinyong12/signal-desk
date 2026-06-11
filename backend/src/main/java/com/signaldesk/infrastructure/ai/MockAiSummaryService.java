package com.signaldesk.infrastructure.ai;

import com.signaldesk.domain.entity.NewsArticle;
import com.signaldesk.domain.entity.Task;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MockAiSummaryService implements AiSummaryService {

    @Override
    public NewsArticle summarizeNews(NewsArticle article) {
        if (article.getSummary() == null || article.getSummary().isBlank()) {
            article.setSummary(article.getTitle() + "에 대한 주요 내용입니다. 관련 동향을 면밀히 살펴볼 필요가 있습니다.");
        }
        if (article.getWhyItMatters() == null || article.getWhyItMatters().isBlank()) {
            article.setWhyItMatters("이 기사는 관심 키워드와 관련된 중요한 정보를 담고 있습니다.");
        }
        if (article.getRecommendedAction() == null || article.getRecommendedAction().isBlank()) {
            article.setRecommendedAction("관련 지표와 시장 반응을 확인하고, 포트폴리오 비중을 점검하세요.");
        }
        return article;
    }

    @Override
    public String generateDailySummary(List<Task> mustDoTasks, List<NewsArticle> topNews) {
        int taskCount = mustDoTasks.size();
        int newsCount = topNews.size();
        StringBuilder sb = new StringBuilder();
        sb.append("오늘은 반드시 처리할 업무 ").append(taskCount).append("개가 있습니다.");
        if (newsCount > 0) {
            sb.append(" 주목해야 할 뉴스 ").append(newsCount).append("건도 확인하세요.");
        }
        if (!mustDoTasks.isEmpty()) {
            sb.append(" 가장 먼저 처리할 일은 [").append(mustDoTasks.get(0).getTitle()).append("]입니다.");
        }
        return sb.toString();
    }

    @Override
    public List<String> generateJudgementPoints(List<Task> tasks, List<NewsArticle> news) {
        List<String> points = new ArrayList<>();

        for (NewsArticle article : news.stream().limit(2).toList()) {
            points.add(article.getTitle() + " - 이 뉴스가 오늘 실제 행동으로 이어져야 하는가?");
        }
        for (Task task : tasks.stream().limit(2).toList()) {
            if (task.getDeadline() != null) {
                points.add("[" + task.getTitle() + "] 마감 전 완료 가능한가?");
            }
        }
        if (points.isEmpty()) {
            points.add("오늘의 핵심 업무를 검토하고 우선순위를 확인하세요.");
        }
        return points;
    }
}
