package com.yourapp.memories.events;

import com.yourapp.memories.entity.MemoryEntity;
import org.springframework.context.ApplicationEvent;

public class MemoryCreatedEvent extends ApplicationEvent {

    private final MemoryEntity memory;

    public MemoryCreatedEvent(Object source, MemoryEntity memory) {
        super(source);
        this.memory = memory;
    }

    public MemoryEntity getMemory() {
        return memory;
    }
}

