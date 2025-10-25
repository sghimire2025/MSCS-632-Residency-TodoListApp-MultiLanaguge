package dev.sghimire.TodoListApp_Java.dto;

import java.time.LocalDateTime;

public record UserResponse(
        Integer id,
        String name,
        String email,
        LocalDateTime createdAt
) {}

