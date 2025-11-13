package services

import (
	"time"

	"backend/models"
	"backend/repositories"
)

type RateLimitService struct {
	repo   repositories.RateLimitRepository
	limit  int
	window time.Duration
}

func NewRateLimitService(repo repositories.RateLimitRepository, limit int, window time.Duration) *RateLimitService {
	return &RateLimitService{
		repo:   repo,
		limit:  limit,
		window: window,
	}
}

func (s *RateLimitService) Limit() int {
	return s.limit
}

func (s *RateLimitService) Allow(token string) (*models.RateLimit, bool, error) {
	rl, err := s.repo.UpsertRateLimit(token, s.window)
	if err != nil {
		return nil, false, err
	}
	if rl.Count > s.limit {
		return rl, false, nil
	}
	return rl, true, nil
}
