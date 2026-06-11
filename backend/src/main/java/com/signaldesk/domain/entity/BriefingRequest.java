package com.signaldesk.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "briefing_requests")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BriefingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // 이 요청이 반영될 브리핑 날짜 (보통 내일)
    @Column(nullable = false)
    private LocalDate targetDate;

    // 자유 텍스트로 입력한 요청 내용
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 처리 여부
    @Builder.Default
    private Boolean processed = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
