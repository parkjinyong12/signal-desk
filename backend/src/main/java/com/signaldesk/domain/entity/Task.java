package com.signaldesk.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.signaldesk.domain.entity.enums.EnergyLevel;
import com.signaldesk.domain.entity.enums.PriorityLevel;
import com.signaldesk.domain.entity.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    private String sourceType;

    private LocalDateTime deadline;

    @Builder.Default
    private Integer estimatedMinutes = 30;

    @Builder.Default
    private Integer importanceScore = 5;

    @Builder.Default
    private Integer urgencyScore = 5;

    private Integer priorityScore;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PriorityLevel priorityLevel = PriorityLevel.C_THIS_WEEK;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EnergyLevel energyLevel = EnergyLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    private LocalDateTime recommendedStartTime;
    private LocalDateTime recommendedEndTime;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
