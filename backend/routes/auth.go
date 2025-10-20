package routes

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/workos/workos-go/v5/pkg/usermanagement"
)

func TestAuth(r *gin.Engine) {
	r.GET("/auth/test", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Workos mangement ready",
		})
	})
}

func LoginHandler(c *gin.Context) {
	url, err := usermanagement.GetAuthorizationURL(usermanagement.GetAuthorizationURLOpts{
		ClientID:    os.Getenv("WORKOS_CLIENT_ID"),
		RedirectURI: os.Getenv("WORKOS_REDIRECT_URI"),
		Provider:    "authkit",
	})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	println("Redirecting to:", url.String())
	c.Redirect(302, url.String())
}

func CallbackHandler(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(400, gin.H{"error": "missing code"})
		return
	}

	res, err := usermanagement.AuthenticateWithCode(
		c.Request.Context(),
		usermanagement.AuthenticateWithCodeOpts{
			ClientID: os.Getenv("WORKOS_CLIENT_ID"),
			Code:     code,
		},
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	email := res.User.Email
	token := res.AccessToken

	log.Printf("User %s authenticated successfully", email)
	log.Printf("Access Token: %s", token)
	// Redirect to Chrome extension callback page
	redirect := fmt.Sprintf(
		"%s?email=%s&token=%s",
		os.Getenv("WORKOS_REDIRECT_URI"),
		url.QueryEscape(email),
		url.QueryEscape(token),
	)
	c.Redirect(http.StatusFound, redirect)
}
