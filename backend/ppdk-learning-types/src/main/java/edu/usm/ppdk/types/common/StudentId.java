package edu.usm.ppdk.types.common;

import java.util.Objects;
import java.util.UUID;

/** A shared student identifier distinct from a teacher identifier. */
public record StudentId(UUID value) {
    public StudentId {
        Objects.requireNonNull(value, "Student ID is required");
    }
}
