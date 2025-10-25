package dev.sghimire.TodoListApp_Java.service;

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
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class TaskService {

    private final TaskRepository tasks;
    private final UserAccountRepository users;
    private final CategoryRepository categories;

    public TaskService(TaskRepository tasks,
                       UserAccountRepository users,
                       CategoryRepository categories) {
        this.tasks = tasks;
        this.users = users;
        this.categories = categories;
    }

    @Transactional
    public TaskResponse create(TaskCreateRequest req, Integer creatorIdHeader) {
        Integer creatorId = (creatorIdHeader != null) ? creatorIdHeader : 1; // fallback demo user
        validateCreate(req);

        Task task = new Task();
        task.setTitle(req.title());
        task.setDescription(req.description());
        task.setStatus(TaskStatus.PENDING);
        task.setCreatedBy(findUser(creatorId));

        if (req.categoryId() != null) {
            task.setCategory(findCategory(req.categoryId()));
        }
        if (req.assigneeId() != null) {
            task.setAssignee(findUser(req.assigneeId()));
        }
        task.setDueDate(req.dueDate());

        Task saved = tasks.save(task);
        return toDto(saved);
    }

    @Transactional
    public TaskResponse update(Integer id, TaskUpdateRequest req) {
        Task t = tasks.findById(id).orElseThrow(() -> notFound("Task", id));

        // Manual optimistic check (in addition to @Version)
        if (!Objects.equals(req.version(), t.getVersion())) {
            throw new OptimisticLockException("Version mismatch");
        }

        if (req.title() != null) t.setTitle(req.title());
        if (req.description() != null) t.setDescription(req.description());

        // Note: This preserves current semantics: only set when non-null is provided
        if (req.categoryId() != null) {
            t.setCategory(findCategory(req.categoryId()));
        }

        if (req.assigneeId() != null) {
            t.setAssignee(findUser(req.assigneeId()));
        }

        if (req.status() != null) {
            t.setStatus(req.status());
            if (req.status() == TaskStatus.COMPLETED) {
                t.setCompletedAt(LocalDateTime.now());
            }
        }

        if (req.dueDate() != null) t.setDueDate(req.dueDate());

        // JPA dirty checking will flush; return DTO view
        return toDto(t);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list(TaskStatus status) {
        var list = (status == null) ? tasks.findAll() : tasks.findByStatus(status);
        return list.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> byAssignee(Integer userId) {
        var user = findUser(userId);
        return tasks.findByAssignee(user).stream().map(this::toDto).toList();
    }

    // ---------------- helpers ----------------
    private void validateCreate(TaskCreateRequest req) {
        if (req.title() == null || req.title().trim().isEmpty()) {
            throw new IllegalArgumentException("Title must not be empty.");
        }
    }

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
}

