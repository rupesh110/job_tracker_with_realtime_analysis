package middleware

import (
	"fmt"
	"net/http"

	"backend/services"

	"github.com/gin-gonic/gin"
)

func RateLimitMiddleware(rl *services.RateLimitService, header string) gin.HandlerFunc {
	return func(c *gin.Context) {

		token := c.GetHeader(header)
		if token == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Missing required header: %s", header),
			})
			return
		}

		allowed, remaining, reset, err := rl.Check(token)
		if err != nil {
			// Print real error so we can debug Redis
			fmt.Printf("RateLimit ERROR: %v\n", err)

			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
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
