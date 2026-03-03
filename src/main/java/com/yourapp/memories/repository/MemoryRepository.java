package com.yourapp.memories.repository;

import com.yourapp.memories.entity.MemoryEntity;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemoryRepository extends JpaRepository<MemoryEntity, Long> {

    List<MemoryEntity> findAllByOrderByDateDescCreatedAtDesc();

    List<MemoryEntity> findByDateBetweenOrderByDateDesc(LocalDate from, LocalDate to);
}

