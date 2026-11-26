package edu.usm.ppdk.domain.identity.model.valobj;

import edu.usm.ppdk.types.exception.BusinessException;

import java.util.Locale;

public record UsernameVO(String value) {
    public UsernameVO {
        if (value == null) throw BusinessException.invalid("username", "Username is required");
        value = value.trim();
        if (value.isEmpty() || value.length() > 100 || value.chars().anyMatch(c -> c > 127)) {
            throw BusinessException.invalid("username", "Username must contain 1 to 100 ASCII characters");
        }
        value = value.toLowerCase(Locale.ROOT);
    }
}
