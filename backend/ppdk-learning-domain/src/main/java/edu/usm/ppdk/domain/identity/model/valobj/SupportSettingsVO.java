package edu.usm.ppdk.domain.identity.model.valobj;

import edu.usm.ppdk.types.exception.BusinessException;

/** Complete settings value. Replace it atomically without merging individual fields from the old object. */
public record SupportSettingsVO(int optionCount, boolean soundEnabled,
                                boolean celebrationEnabled, RewardKindVO rewardKind) {
    public SupportSettingsVO {
        if (optionCount != 2 && optionCount != 3) {
            throw BusinessException.invalid("settings.optionCount", "Option count must be 2 or 3");
        }
        if (rewardKind == null) {
            throw BusinessException.invalid("settings.rewardKind", "Reward kind is required");
        }
    }
}
