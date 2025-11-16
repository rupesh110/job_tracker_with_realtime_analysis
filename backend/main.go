package main

import (
	"backend/config"
	"backend/middleware"
	"backend/repositories"
	"backend/routes"
	"backend/services"
	"log"
	"os"
	"strings"
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
	// Load environment variables silently
	_ = godotenv.Load()

	// Init DB and Redis
	config.InitDB()
	defer config.CloseDB()

	config.InitRedis()

	// WorkOS
	apiKey := os.Getenv("WORKOS_API_KEY")
	usermanagement.SetAPIKey(apiKey)

	// Upstash Rate Limit
	upstashURL := strings.TrimSpace(os.Getenv("UPSTASH_REDIS_REST_URL"))
	upstashToken := strings.TrimSpace(os.Getenv("UPSTASH_REDIS_REST_TOKEN"))

	rateLimitRepo := repositories.NewUpstashRateLimitRepository(upstashURL, upstashToken)
	rateLimitService := services.NewRateLimitService(rateLimitRepo, 100, time.Minute)

	// Create the rate limiter middleware (only passed to job routes)
	rateLimiter := middleware.RateLimitMiddleware(rateLimitService, "Authorization")

	// Setup routes
	r := routes.SetupRouter(rateLimiter)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on 0.0.0.0:%s", port)
	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
