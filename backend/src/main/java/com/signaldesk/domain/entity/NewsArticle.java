package com.signaldesk.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String source;

    @Column(nullable = false)
    private String title;

    @Column(unique = true)
    private String url;

    private LocalDateTime publishedAt;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private String category;

    @Builder.Default
    private Integer importanceScore = 0;

    @Column(columnDefinition = "TEXT")
    private String whyItMatters;

    @Column(columnDefinition = "TEXT")
    private String recommendedAction;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
