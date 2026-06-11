package com.signaldesk.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "daily_briefings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "briefing_date"})
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyBriefing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private LocalDate briefingDate;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Builder.Default
    private Integer mustDoCount = 0;

    @Builder.Default
    private Integer totalTaskCount = 0;

    private LocalDateTime generatedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "dailyBriefing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DailyBriefingItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "dailyBriefing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DailyPlanBlock> planBlocks = new ArrayList<>();
}
