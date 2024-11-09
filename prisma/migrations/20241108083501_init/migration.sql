CREATE TABLE IF NOT EXISTS botguilds (
    channel_id TEXT PRIMARY KEY,
    guild_id   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bots (
    id       TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_verifications (
    id    TEXT PRIMARY KEY,
    token TEXT
);

CREATE TABLE IF NOT EXISTS klines (
    user_id TEXT PRIMARY KEY,
    ip      TEXT,
    reason  TEXT
);

CREATE TABLE IF NOT EXISTS tokens (
    id    TEXT NOT NULL,
    token TEXT NOT NULL,
    seed  TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS users (
    id        TEXT PRIMARY KEY,
    username  TEXT NOT NULL,
    pfp       TEXT,
    email     TEXT,
    password  TEXT,
    activated BOOLEAN DEFAULT false NOT NULL,
    role      BIGINT  DEFAULT 2 NOT NULL,
    bot       BOOLEAN DEFAULT false NOT NULL
);