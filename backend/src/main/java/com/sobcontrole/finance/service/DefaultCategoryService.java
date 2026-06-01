package com.sobcontrole.finance.service;

import com.sobcontrole.finance.domain.Category;
import com.sobcontrole.finance.domain.User;
import com.sobcontrole.finance.repository.CategoryRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DefaultCategoryService {

    private final CategoryRepository categoryRepository;

    public DefaultCategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public void ensureDefaults(User user) {
        if (!categoryRepository.findAllByUserOrderByNameAsc(user).isEmpty()) {
            return;
        }

        categoryRepository.saveAll(List.of(
                Category.builder().name("Alimentação").monthlyLimit(new BigDecimal("700.00")).colorHex("#F77F39").iconKey("restaurant").user(user).build(),
                Category.builder().name("Transporte").monthlyLimit(new BigDecimal("600.00")).colorHex("#4B9CFF").iconKey("directions_bus").user(user).build(),
                Category.builder().name("Lazer").monthlyLimit(new BigDecimal("500.00")).colorHex("#9B5DE5").iconKey("sports_esports").user(user).build(),
                Category.builder().name("Saúde").monthlyLimit(new BigDecimal("500.00")).colorHex("#3BB273").iconKey("favorite").user(user).build(),
                Category.builder().name("Outros").monthlyLimit(new BigDecimal("800.00")).colorHex("#6B7280").iconKey("category").user(user).build()
        ));
    }
}