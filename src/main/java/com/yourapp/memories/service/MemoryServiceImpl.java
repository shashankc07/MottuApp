package com.yourapp.memories.service;

import com.yourapp.memories.dto.MemoryRequestDto;
import com.yourapp.memories.dto.MemoryResponseDto;
import com.yourapp.memories.entity.MemoryEntity;
import com.yourapp.memories.mapper.MemoryMapper;
import com.yourapp.memories.repository.MemoryRepository;
import com.yourapp.shared.exception.NotFoundException;
import com.yourapp.shared.user.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MemoryServiceImpl implements MemoryService {

    private final MemoryRepository memoryRepository;
    private final UserRepository userRepository;

    public MemoryServiceImpl(MemoryRepository memoryRepository, UserRepository userRepository) {
        this.memoryRepository = memoryRepository;
        this.userRepository = userRepository;
    }

    @Override
    public MemoryResponseDto createMemory(MemoryRequestDto requestDto) {
        MemoryEntity entity = MemoryMapper.toEntity(requestDto);
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmailIgnoreCase(currentUserEmail).ifPresent(entity::setCreatedBy);
        MemoryEntity saved = memoryRepository.save(entity);
        return MemoryMapper.toResponseDto(saved);
    }

    @Override
    public MemoryResponseDto updateMemory(Long id, MemoryRequestDto requestDto) {
        MemoryEntity existing = memoryRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Memory not found with id " + id));
        MemoryMapper.updateEntity(requestDto, existing);
        MemoryEntity saved = memoryRepository.save(existing);
        return MemoryMapper.toResponseDto(saved);
    }

    @Override
    public void deleteMemory(Long id) {
        if (!memoryRepository.existsById(id)) {
            throw new NotFoundException("Memory not found with id " + id);
        }
        memoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public MemoryResponseDto getMemory(Long id) {
        MemoryEntity entity = memoryRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Memory not found with id " + id));
        return MemoryMapper.toResponseDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemoryResponseDto> listMemories(LocalDate from, LocalDate to) {
        List<MemoryEntity> entities;
        if (from != null && to != null) {
            entities = memoryRepository.findByDateBetweenOrderByDateDesc(from, to);
        } else {
            entities = memoryRepository.findAllByOrderByDateDescCreatedAtDesc();
        }
        return entities.stream()
            .map(MemoryMapper::toResponseDto)
            .collect(Collectors.toList());
    }
}

