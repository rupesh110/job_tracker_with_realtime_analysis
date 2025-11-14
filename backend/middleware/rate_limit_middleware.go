package middleware

import (
	"fmt"
	"net/http"

	"backend/services"

	"github.com/gin-gonic/gin"
)

func RateLimitMiddleware(rl *services.RateLimitService) gin.HandlerFunc {
	return func(c *gin.Context) {

		userID := c.GetString("user_id")
		if userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Missing user_id. AuthMiddleware must run first.",
			})
			return
		}

		tokenKey := "user:" + userID

		allowed, remaining, reset, err := rl.Check(tokenKey)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Rate limit check failed: %v", err),
			})
			return
		}

		c.Header("X-RateLimit-Limit", fmt.Sprint(rl.Limit()))
		c.Header("X-RateLimit-Remaining", fmt.Sprint(remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprint(reset))

		if !allowed {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "Rate limit exceeded",
				"retry_after": reset,
			})
			return
		}

		c.Next()
	}
}
