package com.signaldesk.domain.repository;

import com.signaldesk.domain.entity.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {
    Optional<NewsArticle> findByUrl(String url);
    List<NewsArticle> findByPublishedAtAfterOrderByImportanceScoreDesc(LocalDateTime after);
    List<NewsArticle> findByCategoryOrderByImportanceScoreDesc(String category);

    @Query("SELECT n FROM NewsArticle n WHERE n.publishedAt >= :since ORDER BY n.importanceScore DESC")
    List<NewsArticle> findRecentNews(LocalDateTime since);

    @Query("SELECT n.url FROM NewsArticle n WHERE n.url IN :urls")
    List<String> findUrlsByUrlIn(List<String> urls);

    boolean existsByTitleAndSource(String title, String source);
}
