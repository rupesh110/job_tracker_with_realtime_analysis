package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

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

		// ✅ Verify and fetch WorkOS user details
		user, err := utils.VerifyWorkOSToken(context.Background(), tokenStr)
		if err != nil {
			log.Println("Token verification failed:", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		log.Printf("Authenticated user: %s (%s)\n", user.Email, user.ID)

		// Store user info in Gin context for downstream handlers
		c.Set("user_id", user.ID)
		c.Set("user_email", user.Email)
		c.Set("user_object", user)

		c.Next()
	}
}
