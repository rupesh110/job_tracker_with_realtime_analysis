package repositories

import (
	"backend/config"
	"backend/models"
	"backend/queries"
	"database/sql"
	"time"
)

type RateLimitRepository interface {
	UpsertRateLimit(token string, window time.Duration) (*models.RateLimit, error)
}

type rateLimitRepository struct {
	db *sql.DB
}

func NewRateLimitRepository() RateLimitRepository {
	return &rateLimitRepository{
		db: config.DB,
	}
}

func (r *rateLimitRepository) UpsertRateLimit(token string, window time.Duration) (*models.RateLimit, error) {
	var (
		windowStart time.Time
		count       int
	)

	err := r.db.QueryRow(
		queries.UpsertRateLimit,
		token,
		window.String(),
	).Scan(&windowStart, &count)

	if err != nil {
		return nil, err
	}

	return &models.RateLimit{
		Token:       token,
		WindowStart: windowStart,
		Count:       count,
	}, nil
}
