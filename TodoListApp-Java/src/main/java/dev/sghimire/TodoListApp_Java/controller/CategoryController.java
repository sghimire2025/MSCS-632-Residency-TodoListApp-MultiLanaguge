package dev.sghimire.TodoListApp_Java.controller;




import dev.sghimire.TodoListApp_Java.dto.CategoryRequest;
import dev.sghimire.TodoListApp_Java.model.Category;
import dev.sghimire.TodoListApp_Java.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryRepository categories;
    public CategoryController(CategoryRepository categories) { this.categories = categories; }

    @PostMapping
    public Category create( @RequestBody CategoryRequest body) {
        // de-dupe by name
        var existing = categories.findByNameIgnoreCase(body.name());
        if (existing.isPresent()) return existing.get();

        var c = new Category();
        c.setName(body.name().trim());
        return categories.save(c);
    }

    @GetMapping
    public List<Category> all() { return categories.findAll(); }
}

