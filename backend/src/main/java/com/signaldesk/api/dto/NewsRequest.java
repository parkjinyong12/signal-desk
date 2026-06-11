package com.signaldesk.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NewsRequest {
    @NotBlank
    private String title;
    private String source;
    private String url;
    private LocalDateTime publishedAt;
    private String content;
    private String category;
}
