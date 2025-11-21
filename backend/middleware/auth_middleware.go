package middleware

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"backend/config"
	"backend/models"
	"backend/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization format"})
			return
		}

		tokenStr := parts[1]

		//  Hash token BEFORE using it as a Redis key
		hashed := utils.HashToken(tokenStr)
		cacheKey := "auth:" + hashed

		// Try reading from Redis
		log.Printf("From caching-----------")
		cachedJSON, _ := config.Redis.Get(cacheKey)
		if cachedJSON != "" {
			log.Printf("From caching1-----------")
			var user models.User
			if json.Unmarshal([]byte(cachedJSON), &user) == nil {
				log.Printf("Authenticated user from cache: %s (%s)\n", user.Email, user.ID)

				c.Set("user_id", user.ID)
				c.Set("user_email", user.Email)
				c.Set("user_object", user)

				c.Next()
				return
			}
		}

		// Cache miss → verify with WorkOS
		user, err := utils.VerifyWorkOSToken(context.Background(), tokenStr)
		if err != nil {
			log.Println("Token verification failed:", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		log.Printf("Authenticated user: %s (%s)\n", user.Email, user.ID)

		// Cache user data using hashed token key
		userJSON, _ := json.Marshal(user)
		_ = config.Redis.Set(cacheKey, string(userJSON), 15*time.Minute)

		// Add user to context
		c.Set("user_id", user.ID)
		c.Set("user_email", user.Email)
		c.Set("user_object", user)

		c.Next()
	}
}
