package queries

const CreateRateLimitsTable = `
CREATE TABLE IF NOT EXISTS rate_limits (
    token TEXT PRIMARY KEY,
    window_start TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL
);
`

const UpsertRateLimit = `
INSERT INTO rate_limits (token, window_start, count)
VALUES ($1, NOW(), 1)
ON CONFLICT (token)
DO UPDATE SET
    window_start = CASE
        WHEN EXCLUDED.window_start >= rate_limits.window_start + ($2::interval)
            THEN EXCLUDED.window_start
        ELSE rate_limits.window_start
    END,
    count = CASE
        WHEN EXCLUDED.window_start >= rate_limits.window_start + ($2::interval)
            THEN 1
        ELSE rate_limits.count + 1
    END
RETURNING window_start, count;
`
