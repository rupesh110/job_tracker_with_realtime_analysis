package middleware

import (
	"net/http"
	"strings"

	"backend/services"

	"github.com/gin-gonic/gin"
)

func RateLimitMiddleware(rlService *services.RateLimitService, header string) gin.HandlerFunc {
	return func(c *gin.Context) {

		path := c.Request.URL.Path

		// Skip swagger docs
		if strings.HasPrefix(path, "/swagger") ||
			path == "/favicon.ico" ||
			path == "/swagger/index.html" {
			c.Next()
			return
		}

		rawToken := c.GetHeader(header)
		if rawToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Missing Authorization header",
			})
			c.Abort()
			return
		}

		// Expect: Authorization: Bearer xxx
		parts := strings.Split(rawToken, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid Authorization header format",
			})
			c.Abort()
			return
		}

		token := parts[1]

		rl, allowed, err := rlService.Allow(token)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Internal server error",
			})
			c.Abort()
			return
		}

		if !allowed {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded",
				"limit": rlService.Limit(),
				"count": rl.Count,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
