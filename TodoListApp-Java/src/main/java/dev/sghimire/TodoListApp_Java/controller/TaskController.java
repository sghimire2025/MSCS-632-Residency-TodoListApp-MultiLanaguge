package dev.sghimire.TodoListApp_Java.controller;

import dev.sghimire.TodoListApp_Java.dto.ApiError;
import dev.sghimire.TodoListApp_Java.dto.TaskCreateRequest;
import dev.sghimire.TodoListApp_Java.dto.TaskResponse;
import dev.sghimire.TodoListApp_Java.dto.TaskUpdateRequest;
import dev.sghimire.TodoListApp_Java.model.Category;
import dev.sghimire.TodoListApp_Java.model.Task;
import dev.sghimire.TodoListApp_Java.model.TaskStatus;
import dev.sghimire.TodoListApp_Java.model.UserAccount;
import dev.sghimire.TodoListApp_Java.repository.CategoryRepository;
import dev.sghimire.TodoListApp_Java.repository.TaskRepository;
import dev.sghimire.TodoListApp_Java.repository.UserAccountRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;




import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository tasks;
    private final UserAccountRepository users;
    private final CategoryRepository categories;

    public TaskController(TaskRepository tasks, UserAccountRepository users, CategoryRepository categories) {
        this.tasks = tasks; this.users = users; this.categories = categories;
    }

    @PostMapping
    public TaskResponse create(@RequestBody TaskCreateRequest req,
                               @RequestHeader(value = "X-User-Id", required = false) Integer creatorId) {
        // fallback demo user if none provided
        if (creatorId == null) creatorId = 1;

        var task = new Task();
        task.setTitle(req.title());
        task.setDescription(req.description());
        task.setStatus(TaskStatus.PENDING);
        task.setCreatedBy(findUser(creatorId));
        if (req.categoryId() != null) task.setCategory(findCategory(req.categoryId()));
        if (req.assigneeId() != null) task.setAssignee(findUser(req.assigneeId()));
        task.setDueDate(req.dueDate());

        task = tasks.save(task);
        return toDto(task);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Integer id, @RequestBody TaskUpdateRequest req) {
        var t = tasks.findById(id).orElseThrow(() -> notFound("Task", id));

        // manual optimistic check (JPA @Version will also enforce at flush)
        if (!Objects.equals(req.version(), t.getVersion()))
            throw new jakarta.persistence.OptimisticLockException("Version mismatch");

        if (req.title() != null) t.setTitle(req.title());
        if (req.description() != null) t.setDescription(req.description());
        if (req.categoryId() != null) t.setCategory(req.categoryId() == null ? null : findCategory(req.categoryId()));
        if (req.assigneeId() != null) t.setAssignee(req.assigneeId() == null ? null : findUser(req.assigneeId()));
        if (req.status() != null) {
            t.setStatus(req.status());
            if (req.status() == TaskStatus.COMPLETED) {
                t.setCompletedAt(java.time.LocalDateTime.now());
            }
        }
        if (req.dueDate() != null) t.setDueDate(req.dueDate());

        return toDto(t); // dirty-check flush on tx end
    }

    @GetMapping
    public List<TaskResponse> list(@RequestParam(required = false) TaskStatus status) {
        var list = (status == null) ? tasks.findAll() : tasks.findByStatus(status);
        return list.stream().map(this::toDto).toList();
    }

    @GetMapping("/assignee/{userId}")
    public List<TaskResponse> byAssignee(@PathVariable Integer userId) {
        var user = findUser(userId);
        return tasks.findByAssignee(user).stream().map(this::toDto).toList();
    }

    // --- helpers ---
    private EntityNotFoundException notFound(String what, Object id) {
        return new EntityNotFoundException(what + " not found: " + id);
    }

    private UserAccount findUser(Integer id) {
        return users.findById(id).orElseThrow(() -> notFound("User", id));
    }
    private Category findCategory(Integer id) {
        return categories.findById(id).orElseThrow(() -> notFound("Category", id));
    }

    private TaskResponse toDto(Task t) {
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getStatus(),
                t.getCategory() != null ? t.getCategory().getId() : null,
                t.getAssignee() != null ? t.getAssignee().getId() : null,
                t.getCreatedBy() != null ? t.getCreatedBy().getId() : null,
                t.getDueDate(),
                t.getCompletedAt(),
                t.getVersion()
        );
    }

    @ExceptionHandler({EntityNotFoundException.class})
    public ResponseEntity<ApiError> handle404(Exception e) {
        return ResponseEntity.status(404).body(new ApiError(e.getMessage()));
    }

    @ExceptionHandler({jakarta.persistence.OptimisticLockException.class})
    public ResponseEntity<ApiError> handle409(Exception e) {
        return ResponseEntity.status(409).body(new ApiError("Update conflict: " + e.getMessage()));
    }
}

