package com.yourapp.memories.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public class MemoryRequestDto {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotNull
    private LocalDate date;

    @Size(max = 2000)
    private String caption;

    @Size(max = 2000)
    private String feelingNote;

    @Size(max = 255)
    private String locationName;

    private Double latitude;

    private Double longitude;

    private List<MemoryMediaDto> media;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public String getFeelingNote() {
        return feelingNote;
    }

    public void setFeelingNote(String feelingNote) {
        this.feelingNote = feelingNote;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public List<MemoryMediaDto> getMedia() {
        return media;
    }

    public void setMedia(List<MemoryMediaDto> media) {
        this.media = media;
    }
}

