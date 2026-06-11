package com.signaldesk.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.signaldesk.domain.entity.enums.BlockType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "daily_plan_blocks")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPlanBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_briefing_id", nullable = false)
    @JsonIgnore
    private DailyBriefing dailyBriefing;

    @Column(nullable = false)
    private String title;

    private LocalTime startTime;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    private BlockType blockType;

    private Long relatedTaskId;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
