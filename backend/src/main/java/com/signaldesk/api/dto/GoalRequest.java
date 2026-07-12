package com.signaldesk.api.dto;

import com.signaldesk.domain.entity.enums.GoalType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GoalRequest {
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private GoalType goalType;
    private Long parentId;
    private LocalDate targetDate;
}
