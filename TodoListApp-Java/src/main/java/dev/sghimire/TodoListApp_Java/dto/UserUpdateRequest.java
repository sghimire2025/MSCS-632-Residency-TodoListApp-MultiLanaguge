package dev.sghimire.TodoListApp_Java.dto;

public record UserUpdateRequest(
        String name,
        String email,
        Integer version // include if you add @Version to the entity later; else remove
) {}
