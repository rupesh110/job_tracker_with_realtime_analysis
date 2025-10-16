package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default() // create a Gin router with default middleware (logger + recovery)

	// Simple GET endpoint
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Hello from Gin server!")
	})

	// Start server on port 8080
	r.Run(":8080")
}
