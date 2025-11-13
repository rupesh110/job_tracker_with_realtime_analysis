package middleware

import "github.com/gin-gonic/gin"

// NoopMiddleware does nothing.
// Used for tests to bypass auth/rate limiting.
func NoopMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
	}
}
