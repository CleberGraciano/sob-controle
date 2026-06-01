package com.sobcontrole.finance.repository;

import com.sobcontrole.finance.domain.Card;
import com.sobcontrole.finance.domain.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findAllByUserOrderByNameAsc(User user);
}