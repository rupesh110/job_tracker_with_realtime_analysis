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
// @BasePath
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

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
