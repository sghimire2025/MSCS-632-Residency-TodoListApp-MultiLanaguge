package dev.sghimire.TodoListApp_Java.dto;

import java.time.LocalDateTime;

public record UserCreateRequest(
        String name,
        String email
) {}



