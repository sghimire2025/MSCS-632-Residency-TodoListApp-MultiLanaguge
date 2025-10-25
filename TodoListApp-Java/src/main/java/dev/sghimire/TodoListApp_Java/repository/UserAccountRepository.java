package dev.sghimire.TodoListApp_Java.repository;

import dev.sghimire.TodoListApp_Java.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Integer> {}
