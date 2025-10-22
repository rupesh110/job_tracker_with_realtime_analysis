package controllers

import (
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// StartSession - Creates a pending login session
func StartSession(c *gin.Context) {
	session, err := services.CreateSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	loginURL, err := services.GetWorkOSAuthURL(session.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session_id": session.ID,
		"login_url":  loginURL,
	})
}

// HandleLogin - redirects user to WorkOS auth page
func HandleLogin(c *gin.Context) {
	sessionID := c.Query("session_id")
	url, err := services.GetWorkOSAuthURL(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Redirect(http.StatusFound, url)
}

// HandleCallback - WorkOS redirects here after login/athentication
func HandleCallback(c *gin.Context) {
	sessionID := c.Query("state")
	code := c.Query("code")

	if err := services.HandleWorkOSCallback(sessionID, code); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Data(http.StatusOK, "text/html", []byte(`
		<html><body style="font-family:sans-serif;text-align:center;margin-top:50px">
		<h2>You’re signed in!</h2>
		<p>You can close this tab and return to Job Tracker.</p>
		</body></html>
	`))
}

// GetSessionStatus - check if session is complete (used for polling)
func GetSessionStatus(c *gin.Context) {
	sessionID := c.Param("id")
	session, err := services.GetSession(sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, session)
}
