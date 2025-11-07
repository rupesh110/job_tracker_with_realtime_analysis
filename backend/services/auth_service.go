package services

import (
	"backend/models"
	"context"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/workos/workos-go/v5/pkg/usermanagement"
)

var (
	sessions = map[string]*models.Session{}
	mu       sync.Mutex
)

// CreateSession creates a pending login session
func CreateSession() (*models.Session, error) {
	id := uuid.NewString()
	mu.Lock()
	defer mu.Unlock()

	s := &models.Session{
		ID:        id,
		Status:    "pending",
		CreatedAt: time.Now().Unix(),
	}

	sessions[id] = s
	return s, nil
}

// GetWorkOSAuthURL builds the workos auth url for a given session id
func GetWorkOSAuthURL(sessionID string) (string, error) {
	opts := usermanagement.GetAuthorizationURLOpts{
		ClientID:    os.Getenv("WORKOS_CLIENT_ID"),
		RedirectURI: os.Getenv("WORKOS_REDIRECT_URI"),
		Provider:    "authkit",
		State:       sessionID,
	}

	url, err := usermanagement.GetAuthorizationURL(opts)
	if err != nil {
		return "", err
	}
	return url.String(), nil
}

// HandleWorkOSCallback exchanges the code for a token and updates the session as complete
func HandleWorkOSCallback(sessionID, code string) error {
	res, err := usermanagement.AuthenticateWithCode(
		context.Background(),
		usermanagement.AuthenticateWithCodeOpts{
			ClientID: os.Getenv("WORKOS_CLIENT_ID"),
			Code:     code,
		})
	if err != nil {
		return err
	}

	user := models.User{
		ID:    res.User.ID,
		Email: res.User.Email,
	}

	session := &models.Session{
		ID:     sessionID,
		Status: "complete",
		Email:  user.Email,
		Token:  res.AccessToken,
		UserID: user.ID,
	}

	mu.Lock()
	sessions[sessionID] = session
	mu.Unlock()

	return nil
}

// GetSession retrieves a session
func GetSession(id string) (*models.Session, error) {
	mu.Lock()
	defer mu.Unlock()
	s, ok := sessions[id]
	if !ok {
		return nil, fmt.Errorf("session not found")
	}
	return s, nil
}
