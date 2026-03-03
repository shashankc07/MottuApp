package com.yourapp.memories.mapper;

import com.yourapp.memories.dto.MemoryMediaDto;
import com.yourapp.memories.dto.MemoryRequestDto;
import com.yourapp.memories.dto.MemoryResponseDto;
import com.yourapp.memories.entity.MemoryEntity;
import com.yourapp.memories.entity.MemoryMediaEntity;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class MemoryMapper {

    private MemoryMapper() {
    }

    public static MemoryEntity toEntity(MemoryRequestDto dto) {
        MemoryEntity entity = new MemoryEntity();
        entity.setTitle(dto.getTitle());
        entity.setDate(dto.getDate());
        entity.setCaption(dto.getCaption());
        entity.setFeelingNote(dto.getFeelingNote());
        entity.setLocationName(dto.getLocationName());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());

        OffsetDateTime now = OffsetDateTime.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        List<MemoryMediaEntity> mediaEntities = new ArrayList<>();
        if (dto.getMedia() != null) {
            for (MemoryMediaDto mediaDto : dto.getMedia()) {
                MemoryMediaEntity mediaEntity = toMediaEntity(mediaDto);
                mediaEntity.setMemory(entity);
                mediaEntity.setCreatedAt(now);
                mediaEntities.add(mediaEntity);
            }
        }
        entity.setMedia(mediaEntities);

        return entity;
    }

    public static void updateEntity(MemoryRequestDto dto, MemoryEntity entity) {
        entity.setTitle(dto.getTitle());
        entity.setDate(dto.getDate());
        entity.setCaption(dto.getCaption());
        entity.setFeelingNote(dto.getFeelingNote());
        entity.setLocationName(dto.getLocationName());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setUpdatedAt(OffsetDateTime.now());

        entity.getMedia().clear();
        if (dto.getMedia() != null) {
            for (MemoryMediaDto mediaDto : dto.getMedia()) {
                MemoryMediaEntity mediaEntity = toMediaEntity(mediaDto);
                mediaEntity.setMemory(entity);
                mediaEntity.setCreatedAt(OffsetDateTime.now());
                entity.getMedia().add(mediaEntity);
            }
        }
    }

    public static MemoryResponseDto toResponseDto(MemoryEntity entity) {
        MemoryResponseDto dto = new MemoryResponseDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDate(entity.getDate());
        dto.setCaption(entity.getCaption());
        dto.setFeelingNote(entity.getFeelingNote());
        dto.setLocationName(entity.getLocationName());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setCreatedByEmail(entity.getCreatedBy() != null ? entity.getCreatedBy().getEmail() : null);

        List<MemoryMediaDto> mediaDtos = new ArrayList<>();
        if (entity.getMedia() != null) {
            for (MemoryMediaEntity mediaEntity : entity.getMedia()) {
                mediaDtos.add(toMediaDto(mediaEntity));
            }
        }
        dto.setMedia(mediaDtos);

        return dto;
    }

    private static MemoryMediaEntity toMediaEntity(MemoryMediaDto dto) {
        MemoryMediaEntity entity = new MemoryMediaEntity();
        entity.setType(MemoryMediaEntity.MediaType.valueOf(dto.getType().toUpperCase()));
        entity.setUrl(dto.getUrl());
        entity.setThumbnailUrl(dto.getThumbnailUrl());
        return entity;
    }

    private static MemoryMediaDto toMediaDto(MemoryMediaEntity entity) {
        MemoryMediaDto dto = new MemoryMediaDto();
        dto.setId(entity.getId());
        dto.setType(entity.getType().name());
        dto.setUrl(entity.getUrl());
        dto.setThumbnailUrl(entity.getThumbnailUrl());
        return dto;
    }
}

