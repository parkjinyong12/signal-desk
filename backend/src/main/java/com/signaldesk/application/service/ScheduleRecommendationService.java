package com.signaldesk.application.service;

import com.signaldesk.domain.entity.DailyBriefing;
import com.signaldesk.domain.entity.DailyPlanBlock;
import com.signaldesk.domain.entity.Task;
import com.signaldesk.domain.entity.enums.BlockType;
import com.signaldesk.domain.entity.enums.EnergyLevel;
import com.signaldesk.domain.entity.enums.PriorityLevel;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class ScheduleRecommendationService {

    private static final List<TimeSlot> BASE_SLOTS = List.of(
        new TimeSlot(LocalTime.of(7, 30), LocalTime.of(8, 0), "아침 브리핑", BlockType.REVIEW, null),
        new TimeSlot(LocalTime.of(9, 30), LocalTime.of(11, 30), null, BlockType.FOCUS_WORK, null),
        new TimeSlot(LocalTime.of(11, 30), LocalTime.of(12, 0), null, BlockType.LIGHT_WORK, null),
        new TimeSlot(LocalTime.of(13, 30), LocalTime.of(15, 0), null, BlockType.MEETING_PREP, null),
        new TimeSlot(LocalTime.of(15, 0), LocalTime.of(17, 0), null, BlockType.LIGHT_WORK, null),
        new TimeSlot(LocalTime.of(20, 0), LocalTime.of(21, 30), null, BlockType.LEARNING, "학습"),
        new TimeSlot(LocalTime.of(21, 30), LocalTime.of(22, 0), null, BlockType.INVESTMENT_CHECK, "투자"),
        new TimeSlot(LocalTime.of(22, 0), LocalTime.of(22, 20), "내일 계획 수립", BlockType.REVIEW, null)
    );

    public List<DailyPlanBlock> generatePlan(DailyBriefing briefing, List<Task> tasks) {
        List<DailyPlanBlock> blocks = new ArrayList<>();
        Queue<Task> highEnergyTasks = new LinkedList<>();
        Queue<Task> normalTasks = new LinkedList<>();
        Queue<Task> learningTasks = new LinkedList<>();
        Queue<Task> investmentTasks = new LinkedList<>();

        for (Task task : tasks) {
            if (task.getPriorityLevel() == null) continue;
            if (PriorityLevel.E_LATER_OR_DELETE.equals(task.getPriorityLevel())) continue;

            String cat = task.getCategory() != null ? task.getCategory().toLowerCase() : "";
            if (cat.contains("학습") || cat.contains("study")) {
                learningTasks.add(task);
            } else if (cat.contains("투자") || cat.contains("invest")) {
                investmentTasks.add(task);
            } else if (EnergyLevel.HIGH.equals(task.getEnergyLevel())) {
                highEnergyTasks.add(task);
            } else {
                normalTasks.add(task);
            }
        }

        for (TimeSlot slot : BASE_SLOTS) {
            if (slot.title() != null) {
                blocks.add(buildBlock(briefing, slot.title(), slot.start(), slot.end(), slot.type(), null));
                continue;
            }

            Task picked = null;
            if (slot.type() == BlockType.FOCUS_WORK && !highEnergyTasks.isEmpty()) {
                picked = highEnergyTasks.poll();
            } else if (slot.type() == BlockType.LEARNING && !learningTasks.isEmpty()) {
                picked = learningTasks.poll();
            } else if (slot.type() == BlockType.INVESTMENT_CHECK && !investmentTasks.isEmpty()) {
                picked = investmentTasks.poll();
            } else if (!normalTasks.isEmpty()) {
                picked = normalTasks.poll();
            } else if (!highEnergyTasks.isEmpty()) {
                picked = highEnergyTasks.poll();
            }

            if (picked != null) {
                LocalTime end = adjustEndTime(slot.start(), picked.getEstimatedMinutes(), slot.end());
                blocks.add(buildBlock(briefing, picked.getTitle(), slot.start(), end, slot.type(), picked.getId()));

                picked.setRecommendedStartTime(LocalDate.now().atTime(slot.start()));
                picked.setRecommendedEndTime(LocalDate.now().atTime(end));
            }
        }

        return blocks;
    }

    private DailyPlanBlock buildBlock(DailyBriefing briefing, String title,
                                       LocalTime start, LocalTime end, BlockType type, Long taskId) {
        return DailyPlanBlock.builder()
            .dailyBriefing(briefing)
            .title(title)
            .startTime(start)
            .endTime(end)
            .blockType(type)
            .relatedTaskId(taskId)
            .build();
    }

    private LocalTime adjustEndTime(LocalTime start, Integer estimatedMinutes, LocalTime maxEnd) {
        if (estimatedMinutes == null) return maxEnd;
        LocalTime computed = start.plusMinutes(estimatedMinutes);
        return computed.isBefore(maxEnd) ? computed : maxEnd;
    }

    private record TimeSlot(LocalTime start, LocalTime end, String title, BlockType type, String categoryHint) {}
}
