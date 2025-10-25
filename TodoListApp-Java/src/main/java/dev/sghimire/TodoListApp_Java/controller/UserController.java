package dev.sghimire.TodoListApp_Java.controller;

import dev.sghimire.TodoListApp_Java.dto.ApiError;
import dev.sghimire.TodoListApp_Java.dto.UserCreateRequest;
import dev.sghimire.TodoListApp_Java.dto.UserResponse;
import dev.sghimire.TodoListApp_Java.dto.UserUpdateRequest;
import dev.sghimire.TodoListApp_Java.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public UserResponse create(@RequestBody UserCreateRequest req) {
        return service.create(req);
    }

    @GetMapping
    public List<UserResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Integer id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Integer id, @RequestBody UserUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }

    // --- basic error mapping (align with your other controllers) ---
    @ExceptionHandler({EntityNotFoundException.class})
    public ResponseEntity<ApiError> handle404(Exception e) {
        return ResponseEntity.status(404).body(new ApiError(e.getMessage()));
    }

    @ExceptionHandler({IllegalArgumentException.class})
    public ResponseEntity<ApiError> handle400(Exception e) {
        return ResponseEntity.badRequest().body(new ApiError(e.getMessage()));
    }
}
