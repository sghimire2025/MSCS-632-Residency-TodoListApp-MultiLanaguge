package dev.sghimire.TodoListApp_Java.dto;


import dev.sghimire.TodoListApp_Java.model.TaskStatus;

import java.time.LocalDate;

public record TaskUpdateRequest(
         Integer version,   // @NotNull optimistic lock
        String title,
        String description,
        Integer categoryId,
        Integer assigneeId,
        TaskStatus status,
        LocalDate dueDate
) {}
