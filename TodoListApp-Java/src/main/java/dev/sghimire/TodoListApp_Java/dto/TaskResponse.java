package dev.sghimire.TodoListApp_Java.dto;

import dev.sghimire.TodoListApp_Java.model.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Integer id,
        String title,
        String description,
        TaskStatus status,
        Integer categoryId,
        String categoryName,
        Integer assigneeId,
        String assigneeName,
        Integer createdById,
        String createdByName,
        LocalDate dueDate,
        LocalDateTime completedAt,
        Integer version
) {}
