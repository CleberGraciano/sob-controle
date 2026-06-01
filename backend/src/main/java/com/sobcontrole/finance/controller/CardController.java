package com.sobcontrole.finance.controller;

import com.sobcontrole.finance.dto.CardRequest;
import com.sobcontrole.finance.dto.CardResponse;
import com.sobcontrole.finance.service.FinanceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final FinanceService financeService;

    public CardController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public ResponseEntity<List<CardResponse>> list() {
        return ResponseEntity.ok(financeService.listCards());
    }

    @PostMapping
    public ResponseEntity<CardResponse> create(@Valid @RequestBody CardRequest request) {
        return ResponseEntity.ok(financeService.createCard(request));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<CardResponse> update(@PathVariable Long cardId, @Valid @RequestBody CardRequest request) {
        return ResponseEntity.ok(financeService.updateCard(cardId, request));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> delete(@PathVariable Long cardId) {
        financeService.deleteCard(cardId);
        return ResponseEntity.noContent().build();
    }
}