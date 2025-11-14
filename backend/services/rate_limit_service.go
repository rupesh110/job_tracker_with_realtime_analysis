package services

import (
	"time"

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

func (s *RateLimitService) Check(key string) (allowed bool, remaining int, reset int, err error) {
	count, ttl, err := s.repo.Increment(key, s.window)
	if err != nil {
		return false, 0, 0, err
	}

	remaining = s.limit - count
	allowed = count <= s.limit

	return allowed, remaining, ttl, nil
}
