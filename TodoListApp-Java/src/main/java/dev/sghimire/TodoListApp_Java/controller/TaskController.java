package dev.sghimire.TodoListApp_Java.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "api/v1")
public class TaskController {

    @GetMapping(value = "/tasks")
    public List<String> getTask(){
        return List.of("task1","task2");
    }
}
