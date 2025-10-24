package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	auth := r.Group("/api/auth")
	auth.GET("/session/start", controllers.StartSession)
	auth.GET("/login", controllers.HandleLogin)
	auth.GET("/callback", controllers.HandleCallback)
	auth.GET("/session/:id", controllers.GetSessionStatus)
}
