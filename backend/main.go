package main

import (
	"backend/config"
	"backend/routes"
	"log"
	"os"

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

	config.InitDB()
	defer config.CloseDB()

	apiKey := os.Getenv("WORKOS_API_KEY")
	usermanagement.SetAPIKey(apiKey)

	r := routes.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on 0.0.0.0:%s", port)
	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
