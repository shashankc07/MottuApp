package com.yourapp.memories.controller;

import com.yourapp.memories.dto.MemoryRequestDto;
import com.yourapp.memories.dto.MemoryResponseDto;
import com.yourapp.memories.service.MemoryService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/memories")
public class MemoryController {

    private final MemoryService memoryService;

    public MemoryController(MemoryService memoryService) {
        this.memoryService = memoryService;
    }

    @PostMapping
    public ResponseEntity<MemoryResponseDto> createMemory(@Valid @RequestBody MemoryRequestDto requestDto) {
        MemoryResponseDto responseDto = memoryService.createMemory(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemoryResponseDto> updateMemory(
        @PathVariable Long id,
        @Valid @RequestBody MemoryRequestDto requestDto
    ) {
        MemoryResponseDto responseDto = memoryService.updateMemory(id, requestDto);
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMemory(@PathVariable Long id) {
        memoryService.deleteMemory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemoryResponseDto> getMemory(@PathVariable Long id) {
        MemoryResponseDto responseDto = memoryService.getMemory(id);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping
    public ResponseEntity<List<MemoryResponseDto>> listMemories(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        List<MemoryResponseDto> memories = memoryService.listMemories(from, to);
        return ResponseEntity.ok(memories);
    }
}

