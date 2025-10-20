package main

import (
	"backend/routes"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/workos/workos-go/v5/pkg/usermanagement"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No .env file found, using system environment variables")
	}

	apiKey := os.Getenv("WORKOS_API_KEY")
	clientID := os.Getenv("WORKOS_CLIENT_ID")

	if apiKey == "" || clientID == "" {
		log.Fatal("❌ Missing WORKOS_API_KEY or WORKOS_CLIENT_ID in environment")
	}

	// ✅ Initialize WorkOS user management
	usermanagement.SetAPIKey(apiKey)

	// Log for debugging (safe for local dev only!)
	if apiKey == "" {
		log.Println("❌ WORKOS_API_KEY not found")
	} else {
		log.Println("✅ WORKOS_API_KEY loaded:", apiKey[:10]+"...") // log first few chars only
	}
	if clientID == "" {
		log.Println("❌ WORKOS_CLIENT_ID not found")
	} else {
		log.Println("✅ WORKOS_CLIENT_ID loaded:", clientID)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // use "*" only for testing
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}))

	routes.TestRoutes(r)
	routes.TestAuth(r)
	r.GET("/auth/login", routes.LoginHandler)
	r.GET("/auth/callback", routes.CallbackHandler)

	log.Println("🚀 Server starting on port 8080...")
	r.Run(":8080")
}
