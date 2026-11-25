package edu.usm.ppdk.domain.identity.service.impl;

import edu.usm.ppdk.domain.identity.adapter.repository.IStudentProfileRepository;
import edu.usm.ppdk.domain.identity.model.aggregate.StudentProfileAggregate;
import edu.usm.ppdk.domain.identity.model.valobj.AvatarKeyVO;
import edu.usm.ppdk.domain.identity.model.valobj.StudentPatchVO;
import edu.usm.ppdk.domain.identity.model.valobj.SupportSettingsVO;
import edu.usm.ppdk.domain.identity.service.IStudentService;
import edu.usm.ppdk.types.common.StudentId;
import edu.usm.ppdk.types.common.TeacherId;
import edu.usm.ppdk.types.exception.BusinessException;

import java.time.Clock;
import java.util.Objects;

public final class StudentServiceImpl implements IStudentService {
    private final IStudentProfileRepository repository;
    private final Clock clock;

    public StudentServiceImpl(IStudentProfileRepository repository, Clock clock) {
        this.repository = Objects.requireNonNull(repository);
        this.clock = Objects.requireNonNull(clock);
    }

    @Override
    public StudentProfileAggregate create(StudentId id, TeacherId owner, String alias,
                                          AvatarKeyVO avatar, SupportSettingsVO settings) {
        var profile = StudentProfileAggregate.create(id, owner, alias, avatar, settings, clock.instant());
        repository.insert(profile);
        return profile;
    }

    @Override
    public StudentProfileAggregate edit(TeacherId owner, StudentId id, long expectedVersion, StudentPatchVO patch) {
        var before = repository.findOwnedForUpdate(owner, id)
                .filter(profile -> profile.id().equals(id) && profile.ownerTeacherId().equals(owner))
                .orElseThrow(() -> new BusinessException("RESOURCE_NOT_FOUND", "Student was not found"));
        var after = before.edit(expectedVersion, patch, clock.instant());
        if (after != before && !repository.updateExpectedVersion(after, expectedVersion)) {
            throw new BusinessException("VERSION_MISMATCH", "Profile version does not match");
        }
        return after;
    }
}
