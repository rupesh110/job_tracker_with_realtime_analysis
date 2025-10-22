package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func TestRoutes(r *gin.Engine) {
	r.GET("/test/ping", controllers.TestController)
}
