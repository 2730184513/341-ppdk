package edu.usm.ppdk.domain.identity.model.entity;

import edu.usm.ppdk.domain.identity.model.valobj.UsernameVO;
import edu.usm.ppdk.types.common.TeacherId;

import java.util.Objects;

/** The password adapter verifies credentials. Keep password hashes out of entity logs. */
public record TeacherAccountEntity(TeacherId id, UsernameVO username, String passwordHash, boolean enabled) {
    public TeacherAccountEntity {
        Objects.requireNonNull(id);
        Objects.requireNonNull(username);
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalArgumentException("Password hash is required");
        }
    }

    @Override
    public String toString() {
        return "TeacherAccountEntity[id=" + id + ", enabled=" + enabled + "]";
    }
}
