package com.yourapp.memories.service;

import com.yourapp.memories.dto.MemoryRequestDto;
import com.yourapp.memories.dto.MemoryResponseDto;
import java.time.LocalDate;
import java.util.List;

public interface MemoryService {

    MemoryResponseDto createMemory(MemoryRequestDto requestDto);

    MemoryResponseDto updateMemory(Long id, MemoryRequestDto requestDto);

    void deleteMemory(Long id);

    MemoryResponseDto getMemory(Long id);

    List<MemoryResponseDto> listMemories(LocalDate from, LocalDate to);
}

