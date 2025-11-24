package main

import (
	"backend/config"
	"backend/middleware"
	"backend/repositories"
	"backend/routes"
	"backend/services"
	"time"

	"github.com/joho/godotenv"
	"github.com/workos/workos-go/v5/pkg/usermanagement"

	_ "backend/docs"

	_ "github.com/joho/godotenv/autoload"
)

// @title Job Tracker API
// @version 1.0
// @description API backend for managing job applications and tracking progress
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Use your JWT token prefixed with "Bearer ", e.g. "Bearer eyJhbGciOiI1NiIsInR5cCI6IkpXVCJ9..."
func main() {
	_ = godotenv.Load()
	config.LoadEnv()

	config.InitDB()
	defer config.CloseDB()
	config.InitRedis()

	// Initialize repositories
	repositories.JobRepo = repositories.NewPgRepository()
	repositories.UserRepo = repositories.NewPgUserRepository()

	usermanagement.SetAPIKey(config.Env.WorkOSKey)

	rateLimitRepo := repositories.NewUpstashRateLimitRepository(
		config.Env.UpstashURL,
		config.Env.UpstashToken,
	)

	rateLimitService := services.NewRateLimitService(rateLimitRepo, 100, time.Minute)
	rateLimiter := middleware.RateLimitMiddleware(rateLimitService, "Authorization")

	r := routes.SetupRouter(rateLimiter)

	port := config.Env.Port
	if port == "" {
		port = "8080"
	}

	r.Run("0.0.0.0:" + port)
}
