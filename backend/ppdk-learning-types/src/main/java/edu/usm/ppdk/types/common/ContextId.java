package edu.usm.ppdk.types.common;

import java.util.Objects;
import java.util.UUID;

/** A shared identifier that binds an identity session to its learning context. */
public record ContextId(UUID value) {
    public ContextId {
        Objects.requireNonNull(value, "Context ID is required");
    }
}
