package edu.usm.ppdk.domain.identity.adapter.repository;

import edu.usm.ppdk.domain.identity.model.aggregate.StudentProfileAggregate;
import edu.usm.ppdk.types.common.StudentId;
import edu.usm.ppdk.types.common.TeacherId;

import java.util.Optional;

/** The caller locks the session before acquiring the student row lock for a write. This interface does not start transactions. */
public interface IStudentProfileRepository {
    Optional<StudentProfileAggregate> findOwnedForUpdate(TeacherId owner, StudentId id);

    void insert(StudentProfileAggregate profile);

    /** A false result means the expected version did not match. Do not overwrite the stored value blindly. */
    boolean updateExpectedVersion(StudentProfileAggregate profile, long expectedVersion);
}
