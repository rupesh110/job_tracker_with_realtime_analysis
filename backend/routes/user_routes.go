package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine) {
	users := r.Group("/api/users")
	{
		users.POST("", controllers.CreateUser)
	}
}
