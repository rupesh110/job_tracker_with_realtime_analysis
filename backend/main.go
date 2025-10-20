package main

import (
	"backend/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// ✅ Custom CORS Middleware (handles chrome-extension:// too)
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Allow Chrome Extension or local dev origins
		if origin == "chrome-extension://ilbdlnbaaanoepljbjbcaglepcmldbao" ||
			origin == "http://localhost:3000" ||
			origin == "https://localhost:3000" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		// Preflight (OPTIONS) requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
	routes.RegisterRoutes1(r)
	r.Run(":8080")
}
