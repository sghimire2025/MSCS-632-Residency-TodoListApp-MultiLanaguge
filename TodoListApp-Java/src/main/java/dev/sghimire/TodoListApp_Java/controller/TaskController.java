package dev.sghimire.TodoListApp_Java.controller;

import dev.sghimire.TodoListApp_Java.dto.ApiError;
import dev.sghimire.TodoListApp_Java.dto.TaskCreateRequest;
import dev.sghimire.TodoListApp_Java.dto.TaskResponse;
import dev.sghimire.TodoListApp_Java.dto.TaskUpdateRequest;
import dev.sghimire.TodoListApp_Java.model.TaskStatus;
import dev.sghimire.TodoListApp_Java.service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @PostMapping
    public TaskResponse create(@RequestBody TaskCreateRequest req,
                               @RequestHeader(value = "X-User-Id", required = false) Integer creatorId) {
        return service.create(req, creatorId);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Integer id, @RequestBody TaskUpdateRequest req) {
        return service.update(id, req);
    }

    @GetMapping
    public List<TaskResponse> list(@RequestParam(required = false) TaskStatus status) {
        return service.list(status);
    }

    @GetMapping("/assignee/{userId}")
    public List<TaskResponse> byAssignee(@PathVariable Integer userId) {
        return service.byAssignee(userId);
    }

    @GetMapping("/assignee/{userId}/recompute-open-count")
    public CompletableFuture<Integer> recompute(@PathVariable Integer userId) {
        return service.recomputeOpenTaskCount(userId);
    }

    // --- same exception handling as before ---
    @ExceptionHandler({EntityNotFoundException.class})
    public ResponseEntity<ApiError> handle404(Exception e) {
        return ResponseEntity.status(404).body(new ApiError(e.getMessage()));
    }

    @ExceptionHandler({OptimisticLockException.class})
    public ResponseEntity<ApiError> handle409(Exception e) {
        return ResponseEntity.status(409).body(new ApiError("Update conflict: " + e.getMessage()));
    }
}



