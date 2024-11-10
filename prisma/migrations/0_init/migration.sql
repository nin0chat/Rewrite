CREATE TABLE IF NOT EXISTS botguilds (
    channel_id TEXT NOT NULL,
    guild_id   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bots (
    id       TEXT NOT NULL,
    owner_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_verifications (
    id    TEXT NOT NULL,
    token TEXT
);

CREATE TABLE IF NOT EXISTS klines (
    user_id TEXT,
    ip      TEXT,
    reason  TEXT
);

CREATE TABLE IF NOT EXISTS tokens (
    id    TEXT NOT NULL,
    token TEXT NOT NULL,
    seed  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id        TEXT NOT NULL,
    username  TEXT NOT NULL,
    pfp       TEXT,
    email     TEXT,
    password  TEXT,
    activated BOOLEAN DEFAULT false NOT NULL,
    role      BIGINT  DEFAULT 2 NOT NULL,
    bot       BOOLEAN DEFAULT false NOT NULL
);