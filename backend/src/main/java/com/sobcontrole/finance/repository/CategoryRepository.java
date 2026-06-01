package com.sobcontrole.finance.repository;

import com.sobcontrole.finance.domain.Category;
import com.sobcontrole.finance.domain.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByUserOrderByNameAsc(User user);
}