package com.signaldesk.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.signaldesk.domain.entity.enums.ItemType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "daily_briefing_items")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyBriefingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_briefing_id", nullable = false)
    @JsonIgnore
    private DailyBriefing dailyBriefing;

    @Enumerated(EnumType.STRING)
    private ItemType itemType;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String recommendedAction;

    private Integer score;

    private Long relatedTaskId;
    private Long relatedNewsId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
