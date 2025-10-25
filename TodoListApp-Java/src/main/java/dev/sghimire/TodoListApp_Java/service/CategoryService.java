package dev.sghimire.TodoListApp_Java.service;

import dev.sghimire.TodoListApp_Java.dto.CategoryRequest;
import dev.sghimire.TodoListApp_Java.model.Category;
import dev.sghimire.TodoListApp_Java.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) {
        this.categories = categories;
    }

    @Transactional
    public Category create(CategoryRequest req) {
        // Normalize + basic validation
        String name = req.name() == null ? "" : req.name().trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Category name must not be empty.");
        }

        // De-dupe by case-insensitive name
        return categories.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    var c = new Category();
                    c.setName(name);
                    return categories.save(c);
                });
    }

    @Transactional(readOnly = true)
    public List<Category> findAll() {
        return categories.findAll();
    }
}
