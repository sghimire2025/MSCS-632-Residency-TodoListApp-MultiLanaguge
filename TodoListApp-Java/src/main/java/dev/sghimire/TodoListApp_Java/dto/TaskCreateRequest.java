package dev.sghimire.TodoListApp_Java.dto;

import java.time.LocalDate;

import java.time.LocalDate;

public record TaskCreateRequest(
        String title, //  @NotBlank @Size(max = 200)
        String description,
        Integer categoryId,   // nullable
        Integer assigneeId,   // nullable
        LocalDate dueDate     // nullable
) {}