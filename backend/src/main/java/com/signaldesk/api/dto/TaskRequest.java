package com.signaldesk.api.dto;

import com.signaldesk.domain.entity.enums.EnergyLevel;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskRequest {
    @NotBlank
    private String title;
    private String description;
    private String category;
    private LocalDateTime deadline;
    private Integer estimatedMinutes = 30;
    private Integer importanceScore = 5;
    private Integer urgencyScore = 5;
    private EnergyLevel energyLevel = EnergyLevel.MEDIUM;
}
