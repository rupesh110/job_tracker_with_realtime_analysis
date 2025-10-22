package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	r.GET("/auth/session/start", controllers.StartSession)
	r.GET("/auth/login", controllers.HandleLogin)
	r.GET("/auth/callback", controllers.HandleCallback)
	r.GET("/auth/session/:id", controllers.GetSessionStatus)
}
