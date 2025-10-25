package dev.sghimire.TodoListApp_Java.repository;

import dev.sghimire.TodoListApp_Java.model.Category;
import dev.sghimire.TodoListApp_Java.model.Task;
import dev.sghimire.TodoListApp_Java.model.TaskStatus;
import dev.sghimire.TodoListApp_Java.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByAssignee(UserAccount assignee);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByCategoryAndStatus(Category category, TaskStatus status);
}