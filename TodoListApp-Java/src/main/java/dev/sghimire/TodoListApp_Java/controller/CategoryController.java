package dev.sghimire.TodoListApp_Java.controller;

import dev.sghimire.TodoListApp_Java.dto.CategoryRequest;
import dev.sghimire.TodoListApp_Java.model.Category;
import dev.sghimire.TodoListApp_Java.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @PostMapping
    public Category create(@RequestBody CategoryRequest body) {
        return service.create(body);
    }

    @GetMapping
    public List<Category> all() {
        return service.findAll();
    }
}
