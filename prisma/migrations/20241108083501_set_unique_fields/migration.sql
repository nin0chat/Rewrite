-- AlterTable
ALTER TABLE botguilds
ADD PRIMARY KEY (channel_id);

-- AlterTable
ALTER TABLE bots
ADD PRIMARY KEY (id);

-- AlterTable
ALTER TABLE email_verifications
ADD PRIMARY KEY (id);

-- AlterTable
ALTER TABLE klines
ADD COLUMN id SERIAL,
ADD PRIMARY KEY (id);

-- AlterTable
ALTER TABLE tokens
ADD PRIMARY KEY (seed);

-- AlterTable
ALTER TABLE users
ADD PRIMARY KEY (id);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_token_key" ON "email_verifications"("token");