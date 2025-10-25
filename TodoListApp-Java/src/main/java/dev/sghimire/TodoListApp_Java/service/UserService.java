package dev.sghimire.TodoListApp_Java.service;

import dev.sghimire.TodoListApp_Java.dto.UserCreateRequest;
import dev.sghimire.TodoListApp_Java.dto.UserResponse;
import dev.sghimire.TodoListApp_Java.dto.UserUpdateRequest;
import dev.sghimire.TodoListApp_Java.model.UserAccount;
import dev.sghimire.TodoListApp_Java.repository.UserAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserAccountRepository users;

    public UserService(UserAccountRepository users) {
        this.users = users;
    }

    @Transactional
    public UserResponse create(UserCreateRequest req) {
        var name = (req.name() == null) ? "" : req.name().trim();
        var email = (req.email() == null) ? "" : req.email().trim().toLowerCase();

        if (name.isEmpty()) throw new IllegalArgumentException("Name must not be empty.");
        if (email.isEmpty()) throw new IllegalArgumentException("Email must not be empty.");

        // Enforce unique email (case-insensitive)
        users.findByEmailIgnoreCase(email).ifPresent(u -> {
            throw new IllegalArgumentException("Email already exists: " + email);
        });

        var u = new UserAccount();
        u.setName(name);
        u.setEmail(email);

        var saved = users.save(u);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return users.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse get(Integer id) {
        return toDto(find(id));
    }

    @Transactional
    public UserResponse update(Integer id, UserUpdateRequest req) {
        var u = find(id);

        if (req.name() != null) {
            var name = req.name().trim();
            if (name.isEmpty()) throw new IllegalArgumentException("Name must not be empty.");
            u.setName(name);
        }
        if (req.email() != null) {
            var email = req.email().trim().toLowerCase();
            if (email.isEmpty()) throw new IllegalArgumentException("Email must not be empty.");
            users.findByEmailIgnoreCase(email)
                    .filter(other -> !other.getId().equals(u.getId()))
                    .ifPresent(other -> { throw new IllegalArgumentException("Email already exists: " + email); });
            u.setEmail(email);
        }

        return toDto(u); // dirty-check flush
    }

    @Transactional
    public void delete(Integer id) {
        var u = find(id);
        users.delete(u);
    }

    // --- helpers ---
    private UserAccount find(Integer id) {
        return users.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }

    private UserResponse toDto(UserAccount u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getCreatedAt());
    }
}
