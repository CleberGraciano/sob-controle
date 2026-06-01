package com.sobcontrole.finance.service;

import com.sobcontrole.finance.domain.Card;
import com.sobcontrole.finance.domain.Category;
import com.sobcontrole.finance.domain.Expense;
import com.sobcontrole.finance.domain.PaymentMethod;
import com.sobcontrole.finance.domain.User;
import com.sobcontrole.finance.dto.AlertResponse;
import com.sobcontrole.finance.dto.CardRequest;
import com.sobcontrole.finance.dto.CardResponse;
import com.sobcontrole.finance.dto.CategoryRequest;
import com.sobcontrole.finance.dto.CategoryResponse;
import com.sobcontrole.finance.dto.CategorySummaryResponse;
import com.sobcontrole.finance.dto.DashboardResponse;
import com.sobcontrole.finance.dto.ExpenseRequest;
import com.sobcontrole.finance.dto.ExpenseResponse;
import com.sobcontrole.finance.dto.MonthlyReportResponse;
import com.sobcontrole.finance.dto.SuggestionResponse;
import com.sobcontrole.finance.repository.CardRepository;
import com.sobcontrole.finance.repository.CategoryRepository;
import com.sobcontrole.finance.repository.ExpenseRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinanceService {

    private final CategoryRepository categoryRepository;
    private final CardRepository cardRepository;
    private final ExpenseRepository expenseRepository;
    private final CurrentUserService currentUserService;

    public FinanceService(CategoryRepository categoryRepository,
                          CardRepository cardRepository,
                          ExpenseRepository expenseRepository,
                          CurrentUserService currentUserService) {
        this.categoryRepository = categoryRepository;
        this.cardRepository = cardRepository;
        this.expenseRepository = expenseRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        User user = currentUserService.requireCurrentUser();
        return categoryRepository.findAllByUserOrderByNameAsc(user).stream()
            .map(category -> new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getMonthlyLimit(),
                category.getColorHex(),
                category.getIconKey(),
                category.isSystemDefined()))
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        User user = currentUserService.requireCurrentUser();
        Category category = categoryRepository.save(Category.builder()
                .name(request.name())
                .monthlyLimit(request.monthlyLimit())
                .colorHex(request.colorHex())
                .iconKey(request.iconKey())
            .systemDefined(false)
                .user(user)
                .build());
        return mapCategory(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {
        User user = currentUserService.requireCurrentUser();
        Category category = categoryRepository.findById(categoryId)
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        ensureCategoryEditable(category);

        category.setName(request.name());
        category.setMonthlyLimit(request.monthlyLimit());
        category.setColorHex(request.colorHex());
        category.setIconKey(request.iconKey());

        return mapCategory(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        User user = currentUserService.requireCurrentUser();
        Category category = categoryRepository.findById(categoryId)
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        ensureCategoryEditable(category);

        if (expenseRepository.existsByUserAndCategory(user, category)) {
            throw new IllegalArgumentException("Nao e possivel excluir uma categoria com lancamentos vinculados.");
        }

        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public List<CardResponse> listCards() {
        User user = currentUserService.requireCurrentUser();
        return cardRepository.findAllByUserOrderByNameAsc(user).stream()
                .map(card -> new CardResponse(card.getId(), card.getName(), card.getBrand(), card.getLastDigits(), card.isCredit()))
                .toList();
    }

    @Transactional
    public CardResponse createCard(CardRequest request) {
        User user = currentUserService.requireCurrentUser();
        Card card = cardRepository.save(Card.builder()
                .name(request.name())
                .brand(request.brand())
                .lastDigits(request.lastDigits())
                .credit(request.credit())
                .user(user)
                .build());
        return new CardResponse(card.getId(), card.getName(), card.getBrand(), card.getLastDigits(), card.isCredit());
    }

    @Transactional
    public CardResponse updateCard(Long cardId, CardRequest request) {
        User user = currentUserService.requireCurrentUser();
        Card card = cardRepository.findById(cardId)
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));

        card.setName(request.name());
        card.setBrand(request.brand());
        card.setLastDigits(request.lastDigits());
        card.setCredit(request.credit());

        return new CardResponse(card.getId(), card.getName(), card.getBrand(), card.getLastDigits(), card.isCredit());
    }

    @Transactional
    public void deleteCard(Long cardId) {
        User user = currentUserService.requireCurrentUser();
        Card card = cardRepository.findById(cardId)
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));

        expenseRepository.findAllByUserAndCard(user, card).forEach(expense -> expense.setCard(null));
        cardRepository.delete(card);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> listRecentExpenses() {
        User user = currentUserService.requireCurrentUser();
        return expenseRepository.findTop5ByUserOrderByPurchaseDateDesc(user).stream()
                .map(this::mapExpense)
                .toList();
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User user = currentUserService.requireCurrentUser();
        Category category = resolveCategory(user, request.categoryId());
        Card card = resolveCard(user, request.paymentMethod(), request.cardId());

        Expense expense = expenseRepository.save(Expense.builder()
                .itemName(request.itemName())
                .amount(request.amount())
                .purchaseDate(request.purchaseDate())
                .paymentMethod(request.paymentMethod())
                .installmentPurchase(request.installmentPurchase())
                .installmentCount(request.installmentPurchase() ? request.installmentCount() : null)
                .installmentValue(request.installmentPurchase() ? request.installmentValue() : null)
            .receiptName(sanitizeReceiptName(request.receiptName()))
            .receiptDataUrl(sanitizeReceiptDataUrl(request.receiptDataUrl()))
                .createdAt(java.time.LocalDateTime.now())
                .user(user)
                .category(category)
                .card(card)
                .build());

        user.setPreferredPaymentMethod(resolveMostUsedPaymentMethod(user));
        return mapExpense(expense);
    }

    @Transactional
    public void deleteExpense(Long expenseId) {
        User user = currentUserService.requireCurrentUser();
        Expense expense = expenseRepository.findById(expenseId)
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        expenseRepository.delete(expense);
        user.setPreferredPaymentMethod(resolveMostUsedPaymentMethod(user));
    }

    @Transactional
    public ExpenseResponse updateExpense(Long expenseId, ExpenseRequest request) {
        User user = currentUserService.requireCurrentUser();
        Expense expense = expenseRepository.findById(expenseId)
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        Category category = resolveCategory(user, request.categoryId());
        Card card = resolveCard(user, request.paymentMethod(), request.cardId());

        expense.setItemName(request.itemName());
        expense.setAmount(request.amount());
        expense.setPurchaseDate(request.purchaseDate());
        expense.setPaymentMethod(request.paymentMethod());
        expense.setInstallmentPurchase(request.installmentPurchase());
        expense.setInstallmentCount(request.installmentPurchase() ? request.installmentCount() : null);
        expense.setInstallmentValue(request.installmentPurchase() ? request.installmentValue() : null);
        expense.setReceiptName(sanitizeReceiptName(request.receiptName()));
        expense.setReceiptDataUrl(sanitizeReceiptDataUrl(request.receiptDataUrl()));
        expense.setCategory(category);
        expense.setCard(card);

        user.setPreferredPaymentMethod(resolveMostUsedPaymentMethod(user));
        return mapExpense(expense);
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(int year, int month) {
        User user = currentUserService.requireCurrentUser();
        YearMonth yearMonth = YearMonth.of(year, month);
        List<Category> categories = categoryRepository.findAllByUserOrderByNameAsc(user);
        List<Expense> monthExpenses = expenseRepository.findAllByUserAndPurchaseDateBetweenOrderByPurchaseDateDesc(
                user,
                yearMonth.atDay(1),
                yearMonth.atEndOfMonth()
        );

        List<CategorySummaryResponse> categorySummaries = buildCategorySummaries(categories, monthExpenses);
        BigDecimal monthSpent = monthExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLimit = categories.stream().map(Category::getMonthlyLimit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal available = totalLimit.subtract(monthSpent);
        int progressPercent = percentage(monthSpent, totalLimit);

        return new DashboardResponse(
                monthSpent,
                totalLimit,
                available,
                progressPercent,
                resolveMostUsedPaymentMethod(user),
                categorySummaries,
                monthExpenses.stream().limit(5).map(this::mapExpense).toList(),
                buildTrend(monthExpenses, yearMonth),
                buildAlerts(categorySummaries),
                buildSuggestions(categorySummaries)
        );
    }

    @Transactional(readOnly = true)
    public MonthlyReportResponse getMonthlyReport(int year, int month) {
        User user = currentUserService.requireCurrentUser();
        YearMonth yearMonth = YearMonth.of(year, month);
        List<Category> categories = categoryRepository.findAllByUserOrderByNameAsc(user);
        List<Expense> monthExpenses = expenseRepository.findAllByUserAndPurchaseDateBetweenOrderByPurchaseDateDesc(
                user,
                yearMonth.atDay(1),
                yearMonth.atEndOfMonth()
        );

        BigDecimal totalSpent = monthExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageDaily = monthExpenses.isEmpty()
                ? BigDecimal.ZERO
                : totalSpent.divide(BigDecimal.valueOf(yearMonth.lengthOfMonth()), 2, RoundingMode.HALF_UP);
        BigDecimal highestExpense = monthExpenses.stream().map(Expense::getAmount).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        List<CategorySummaryResponse> categorySummaries = buildCategorySummaries(categories, monthExpenses);
        List<SuggestionResponse> suggestions = buildSuggestions(categorySummaries);
        String insight = categorySummaries.stream()
                .max(Comparator.comparing(CategorySummaryResponse::spent))
                .map(summary -> "Maior concentração em " + summary.category() + " com " + summary.percentage() + "% do limite consumido.")
                .orElse("Nenhum gasto registrado no período.");

        return new MonthlyReportResponse(
                yearMonth.toString(),
                totalSpent,
                averageDaily,
                highestExpense,
                monthExpenses.size(),
                categorySummaries,
            monthExpenses.stream().map(this::mapExpense).toList(),
                suggestions,
                insight
        );
    }

    @Transactional(readOnly = true)
    public List<PaymentMethod> getPaymentMethods() {
        return List.of(PaymentMethod.values());
    }

    private PaymentMethod resolveMostUsedPaymentMethod(User user) {
        List<Expense> expenses = expenseRepository.findAllByUserOrderByPurchaseDateDesc(user);
        if (expenses.isEmpty()) {
            return user.getPreferredPaymentMethod() != null ? user.getPreferredPaymentMethod() : PaymentMethod.PIX;
        }

        Map<PaymentMethod, Long> counter = expenses.stream().collect(Collectors.groupingBy(Expense::getPaymentMethod, () -> new EnumMap<>(PaymentMethod.class), Collectors.counting()));
        return counter.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(PaymentMethod.PIX);
    }

    private List<CategorySummaryResponse> buildCategorySummaries(List<Category> categories, List<Expense> expenses) {
        Map<Long, BigDecimal> totalsByCategory = expenses.stream().collect(Collectors.groupingBy(expense -> expense.getCategory().getId(), Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        return categories.stream()
                .map(category -> {
                    BigDecimal spent = totalsByCategory.getOrDefault(category.getId(), BigDecimal.ZERO);
                    return new CategorySummaryResponse(
                            category.getId(),
                            category.getName(),
                            category.getColorHex(),
                            category.getIconKey(),
                            spent,
                            category.getMonthlyLimit(),
                            percentage(spent, category.getMonthlyLimit())
                    );
                })
                .sorted(Comparator.comparing(CategorySummaryResponse::spent).reversed())
                .toList();
    }

    private List<DashboardResponse.TrendPoint> buildTrend(List<Expense> expenses, YearMonth yearMonth) {
        BigDecimal accumulated = BigDecimal.ZERO;
        List<DashboardResponse.TrendPoint> points = new ArrayList<>();
        Map<Integer, BigDecimal> totalsByDay = expenses.stream().collect(Collectors.groupingBy(expense -> expense.getPurchaseDate().getDayOfMonth(), Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            accumulated = accumulated.add(totalsByDay.getOrDefault(day, BigDecimal.ZERO));
            points.add(new DashboardResponse.TrendPoint(day, accumulated));
        }
        return points;
    }

    private List<AlertResponse> buildAlerts(List<CategorySummaryResponse> summaries) {
        return summaries.stream()
                .filter(summary -> summary.percentage() >= 80)
                .map(summary -> new AlertResponse(
                        summary.category(),
                        summary.percentage() >= 100 ? "LIMITE_EXCEDIDO" : "ATENCAO",
                        summary.percentage() >= 100
                                ? "Você excedeu o limite definido para esta categoria."
                                : "Você está próximo do limite mensal desta categoria.",
                        summary.percentage()
                ))
                .toList();
    }

    private List<SuggestionResponse> buildSuggestions(List<CategorySummaryResponse> summaries) {
        return summaries.stream()
                .filter(summary -> summary.spent().compareTo(BigDecimal.ZERO) > 0)
                .limit(3)
                .map(summary -> {
                    BigDecimal savings = summary.spent().multiply(new BigDecimal("0.12")).setScale(2, RoundingMode.HALF_UP);
                    return new SuggestionResponse(
                            "Economia em " + summary.category(),
                            switch (summary.category().toLowerCase()) {
                                case "alimentação" -> "Reduza delivery em 2 pedidos por semana e priorize compras planejadas.";
                                case "transporte" -> "Avalie rotas compartilhadas, transporte público em dias alternados ou abastecimento programado.";
                                case "lazer" -> "Substitua parte das saídas pagas por atividades gratuitas ou assinaturas compartilhadas.";
                                default -> "Reveja recorrências e compare preços antes de repetir compras nessa categoria.";
                            },
                            savings
                    );
                })
                .toList();
    }

    private ExpenseResponse mapExpense(Expense expense) {
        String cardLabel = expense.getCard() == null ? null : expense.getCard().getName() + " (**** " + expense.getCard().getLastDigits() + ")";
        return new ExpenseResponse(
                expense.getId(),
                expense.getItemName(),
                expense.getAmount(),
                expense.getPurchaseDate(),
                expense.getPaymentMethod(),
                expense.getCategory().getId(),
                expense.getCategory().getName(),
                expense.getCard() == null ? null : expense.getCard().getId(),
                cardLabel,
                expense.isInstallmentPurchase(),
                expense.getInstallmentCount(),
                expense.getInstallmentValue(),
                expense.getReceiptName(),
                expense.getReceiptDataUrl()
        );
    }

    private String sanitizeReceiptName(String receiptName) {
        return receiptName == null || receiptName.isBlank() ? null : receiptName.trim();
    }

    private String sanitizeReceiptDataUrl(String receiptDataUrl) {
        if (receiptDataUrl == null || receiptDataUrl.isBlank()) {
            return null;
        }

        String trimmed = receiptDataUrl.trim();
        if (!trimmed.startsWith("data:")) {
            throw new IllegalArgumentException("Comprovante invalido");
        }

        if (trimmed.length() > 5_000_000) {
            throw new IllegalArgumentException("Comprovante excede o tamanho permitido");
        }

        return trimmed;
    }

    private Category resolveCategory(User user, Long categoryId) {
        return categoryRepository.findById(categoryId)
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
    }

    private Card resolveCard(User user, PaymentMethod paymentMethod, Long cardId) {
        if ((paymentMethod != PaymentMethod.CREDIT_CARD && paymentMethod != PaymentMethod.DEBIT_CARD) || cardId == null) {
            return null;
        }

        return cardRepository.findById(cardId)
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
    }

    private int percentage(BigDecimal spent, BigDecimal limit) {
        if (limit == null || limit.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        return spent.multiply(BigDecimal.valueOf(100)).divide(limit, 0, RoundingMode.HALF_UP).intValue();
    }

    private CategoryResponse mapCategory(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getMonthlyLimit(),
                category.getColorHex(),
                category.getIconKey(),
                category.isSystemDefined());
    }

    private void ensureCategoryEditable(Category category) {
        if (category.isSystemDefined()) {
            throw new IllegalArgumentException("As categorias padrao do sistema nao podem ser editadas ou excluidas.");
        }
    }
}