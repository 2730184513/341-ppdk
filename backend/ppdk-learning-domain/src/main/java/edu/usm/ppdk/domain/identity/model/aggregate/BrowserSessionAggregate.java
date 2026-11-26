package edu.usm.ppdk.domain.identity.model.aggregate;

import edu.usm.ppdk.domain.identity.model.valobj.SessionModeVO;
import edu.usm.ppdk.domain.identity.model.valobj.SessionPrincipalVO;
import edu.usm.ppdk.types.common.ContextId;
import edu.usm.ppdk.types.common.TeacherId;
import edu.usm.ppdk.types.exception.BusinessException;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/** Current database session state. The calling transaction owns atomic row rotation and session mode persistence. */
public record BrowserSessionAggregate(UUID id, String credentialHash, SessionModeVO mode,
                                       TeacherId teacherId, ContextId contextId, String csrfSecret,
                                       Instant createdAt, Instant lastSeenAt, Instant expiresAt, Instant revokedAt) {
    private static final Duration IDLE_TIMEOUT = Duration.ofMinutes(30);
    private static final Duration AUTHENTICATED_LIFETIME = Duration.ofHours(8);

    public BrowserSessionAggregate {
        Objects.requireNonNull(id);
        Objects.requireNonNull(mode);
        Objects.requireNonNull(createdAt);
        Objects.requireNonNull(lastSeenAt);
        Objects.requireNonNull(expiresAt);
        if (credentialHash == null || !credentialHash.matches("[0-9a-f]{64}")
                || csrfSecret == null || !csrfSecret.matches("[A-Za-z0-9_-]{43}")) {
            throw new IllegalArgumentException("Invalid session secret material");
        }
        boolean validIdentity = switch (mode) {
            case ANONYMOUS -> teacherId == null && contextId == null;
            case TEACHER -> teacherId != null && contextId == null;
            case LEARNER -> teacherId == null && contextId != null;
        };
        if (!validIdentity || !expiresAt.isAfter(createdAt) || lastSeenAt.isBefore(createdAt)
                || (revokedAt != null && revokedAt.isBefore(createdAt))) {
            throw new IllegalArgumentException("Invalid session identity or timeline");
        }
    }

    public static BrowserSessionAggregate anonymous(UUID id, String hash, String csrf, Instant now) {
        return new BrowserSessionAggregate(id, hash, SessionModeVO.ANONYMOUS, null, null, csrf,
                now, now, now.plus(IDLE_TIMEOUT), null);
    }

    public static BrowserSessionAggregate teacher(UUID id, String hash, TeacherId teacher, String csrf, Instant now) {
        return new BrowserSessionAggregate(id, hash, SessionModeVO.TEACHER, teacher, null, csrf,
                now, now, now.plus(AUTHENTICATED_LIFETIME), null);
    }

    public Instant effectiveExpiry() {
        Instant idleExpiry = lastSeenAt.plus(IDLE_TIMEOUT);
        return mode == SessionModeVO.TEACHER && idleExpiry.isBefore(expiresAt) ? idleExpiry : expiresAt;
    }

    public boolean currentAt(Instant now) {
        return revokedAt == null && effectiveExpiry().isAfter(now);
    }

    public SessionPrincipalVO principal(Instant now) {
        requireCurrent(now);
        return new SessionPrincipalVO(id, mode, teacherId, contextId, effectiveExpiry());
    }

    /** Call only after object-level authorization succeeds. The initial filter must not update this state. */
    public BrowserSessionAggregate touch(Instant now) {
        requireCurrent(now);
        return new BrowserSessionAggregate(id, credentialHash, mode, teacherId, contextId, csrfSecret,
                createdAt, now.isBefore(lastSeenAt) ? lastSeenAt : now, expiresAt, null);
    }

    public BrowserSessionAggregate downgrade(ContextId context, String newCsrf, Instant now) {
        requireCurrent(now);
        Objects.requireNonNull(context);
        if (mode == SessionModeVO.LEARNER && context.equals(contextId)) {
            return this;
        }
        if (mode != SessionModeVO.TEACHER) {
            throw new BusinessException("ROLE_FORBIDDEN", "Current session cannot activate this context");
        }
        return new BrowserSessionAggregate(id, credentialHash, SessionModeVO.LEARNER, null, context, newCsrf,
                createdAt, now, now.plus(AUTHENTICATED_LIFETIME), null);
    }

    public BrowserSessionAggregate revoke(Instant now) {
        if (revokedAt != null) return this;
        return new BrowserSessionAggregate(id, credentialHash, mode, teacherId, contextId, csrfSecret,
                createdAt, lastSeenAt, expiresAt, now);
    }

    private void requireCurrent(Instant now) {
        if (!currentAt(now)) throw new BusinessException("AUTH_REQUIRED", "Current authentication is required");
    }

    @Override
    public String toString() {
        return "BrowserSessionAggregate[id=" + id + ", mode=" + mode + "]";
    }
}
