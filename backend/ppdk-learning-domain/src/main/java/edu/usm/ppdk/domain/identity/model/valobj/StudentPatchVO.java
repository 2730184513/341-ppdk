package edu.usm.ppdk.domain.identity.model.valobj;

import edu.usm.ppdk.types.exception.BusinessException;

/** A null field here means it was omitted. The HTTP adapter rejects explicit JSON null. */
public record StudentPatchVO(String alias, AvatarKeyVO avatarKey, SupportSettingsVO settings, Boolean archived) {
    public StudentPatchVO {
        if (alias == null && avatarKey == null && settings == null && archived == null) {
            throw BusinessException.invalid("$", "At least one profile field is required");
        }
        if (Boolean.FALSE.equals(archived)) {
            throw BusinessException.invalid("archived", "Archiving cannot be reversed");
        }
    }
}
