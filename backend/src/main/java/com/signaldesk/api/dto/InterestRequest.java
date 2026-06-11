package com.signaldesk.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InterestRequest {
    @NotBlank
    private String category;
    @NotBlank
    private String keyword;
    private Integer weight = 5;
    private Boolean enabled = true;
}
