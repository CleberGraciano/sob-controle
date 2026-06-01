package com.sobcontrole.finance.repository;

import com.sobcontrole.finance.domain.Expense;
import com.sobcontrole.finance.domain.Card;
import com.sobcontrole.finance.domain.Category;
import com.sobcontrole.finance.domain.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findAllByUserAndPurchaseDateBetweenOrderByPurchaseDateDesc(User user, LocalDate startDate, LocalDate endDate);

    List<Expense> findAllByUserOrderByPurchaseDateDesc(User user);

    List<Expense> findTop5ByUserOrderByPurchaseDateDesc(User user);

    boolean existsByUserAndCategory(User user, Category category);

    List<Expense> findAllByUserAndCard(User user, Card card);
}