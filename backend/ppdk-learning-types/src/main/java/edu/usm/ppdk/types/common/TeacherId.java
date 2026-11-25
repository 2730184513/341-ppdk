package edu.usm.ppdk.types.common;

import java.util.Objects;
import java.util.UUID;

/** The owner identifier used by identity, learning, and reporting. */
public record TeacherId(UUID value) {
    public TeacherId {
        Objects.requireNonNull(value, "Teacher ID is required");
    }
}
