package edu.usm.ppdk.domain.identity.model.valobj;

import edu.usm.ppdk.types.common.ContextId;
import edu.usm.ppdk.types.common.TeacherId;

import java.time.Instant;
import java.util.UUID;

/** Build from the current valid session without credential hashes or CSRF material. */
public record SessionPrincipalVO(UUID sessionId, SessionModeVO mode, TeacherId teacherId,
                                 ContextId contextId, Instant effectiveExpiry) {
}
