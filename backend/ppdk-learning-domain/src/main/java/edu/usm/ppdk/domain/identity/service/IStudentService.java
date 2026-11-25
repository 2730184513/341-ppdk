package edu.usm.ppdk.domain.identity.service;

import edu.usm.ppdk.domain.identity.model.aggregate.StudentProfileAggregate;
import edu.usm.ppdk.domain.identity.model.valobj.AvatarKeyVO;
import edu.usm.ppdk.domain.identity.model.valobj.StudentPatchVO;
import edu.usm.ppdk.domain.identity.model.valobj.SupportSettingsVO;
import edu.usm.ppdk.types.common.StudentId;
import edu.usm.ppdk.types.common.TeacherId;

/** The calling case must lock and reauthorize the teacher session in the current transaction first. */
public interface IStudentService {
    StudentProfileAggregate create(StudentId id, TeacherId owner, String alias,
                                   AvatarKeyVO avatar, SupportSettingsVO settings);

    StudentProfileAggregate edit(TeacherId owner, StudentId id, long expectedVersion, StudentPatchVO patch);
}
