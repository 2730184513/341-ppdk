CREATE TABLE teacher (
    id uuid PRIMARY KEY,
    username varchar(100) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL CHECK (char_length(password_hash) > 0),
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz(3) NOT NULL,
    CONSTRAINT teacher_normalized_username CHECK (
        username = lower(btrim(username)) AND char_length(username) BETWEEN 1 AND 100
        AND octet_length(username) = char_length(username)
    )
);

CREATE TABLE student_profile (
    id uuid PRIMARY KEY,
    owner_teacher_id uuid NOT NULL REFERENCES teacher(id),
    alias varchar(40) NOT NULL CHECK (char_length(btrim(alias)) BETWEEN 1 AND 40),
    avatar_key varchar(16) NOT NULL CHECK (avatar_key IN ('AVATAR_1', 'AVATAR_2', 'AVATAR_3')),
    option_count smallint NOT NULL CHECK (option_count IN (2, 3)),
    sound_enabled boolean NOT NULL DEFAULT false,
    celebration_enabled boolean NOT NULL DEFAULT false,
    reward_kind varchar(8) NOT NULL CHECK (reward_kind IN ('STAR', 'LEAF')),
    archived_at timestamptz(3),
    version bigint NOT NULL CHECK (version >= 1),
    created_at timestamptz(3) NOT NULL,
    updated_at timestamptz(3) NOT NULL,
    CONSTRAINT student_profile_id_owner_unique UNIQUE (id, owner_teacher_id)
);

CREATE INDEX student_profile_owner_created_idx
    ON student_profile(owner_teacher_id, created_at DESC, id DESC);

CREATE TABLE browser_session (
    id uuid PRIMARY KEY,
    credential_hash char(64) NOT NULL UNIQUE CHECK (credential_hash ~ '^[0-9a-f]{64}$'),
    mode varchar(16) NOT NULL CHECK (mode IN ('ANONYMOUS', 'TEACHER', 'LEARNER')),
    teacher_id uuid REFERENCES teacher(id),
    -- V4 adds the context foreign key after creating learning_context.
    context_id uuid,
    csrf_secret varchar(128) NOT NULL CHECK (csrf_secret ~ '^[A-Za-z0-9_-]{43}$'),
    created_at timestamptz(3) NOT NULL,
    last_seen_at timestamptz(3) NOT NULL,
    expires_at timestamptz(3) NOT NULL CHECK (expires_at > created_at),
    revoked_at timestamptz(3),
    CONSTRAINT browser_session_identity_mode CHECK (
        (mode = 'ANONYMOUS' AND teacher_id IS NULL AND context_id IS NULL)
        OR (mode = 'TEACHER' AND teacher_id IS NOT NULL AND context_id IS NULL)
        OR (mode = 'LEARNER' AND teacher_id IS NULL AND context_id IS NOT NULL)
    )
);

CREATE INDEX browser_session_expiry_idx ON browser_session(expires_at);
