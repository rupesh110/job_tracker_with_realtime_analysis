package utils

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"github.com/workos/workos-go/v5/pkg/usermanagement"
)

func VerifyWorkOSToken(ctx context.Context, tokenStr string) (*usermanagement.User, error) {
	clientID := os.Getenv("WORKOS_CLIENT_ID")

	// 1 Get JWKS URL from WorkOS
	jwksURL, err := usermanagement.GetJWKSURL(clientID)
	if err != nil {
		return nil, fmt.Errorf("failed to get JWKS URL: %w", err)
	}

	// 2️ Fetch JWKS
	resp, err := http.Get(jwksURL.String())
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	set, err := jwk.ParseReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JWKS: %w", err)
	}

	// Parse + verify JWT
	tok, err := jwt.ParseString(tokenStr, jwt.WithKeySet(set), jwt.WithValidate(true))
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired()) {
			return nil, fmt.Errorf("token expired, please refresh your session")
		}
		return nil, fmt.Errorf("token verification failed: %w", err)
	}

	// Log expiration time (useful for debugging)
	if exp := tok.Expiration(); !exp.IsZero() {
		log.Printf("Token expires at: %s (%s)\n", exp.UTC().Format(time.RFC3339), exp.Local())
	}

	// Extract user_id
	sub, ok := tok.Get("sub")
	if !ok {
		return nil, fmt.Errorf("missing user_id (sub) in token")
	}
	userID := sub.(string)
	log.Println("🔹 Verified WorkOS user ID:", userID)

	// Fetch user details
	opts := usermanagement.GetUserOpts{User: userID}
	user, err := usermanagement.GetUser(ctx, opts)
	if err != nil {
		log.Println("Failed to fetch user info from WorkOS:", err)
		return nil, fmt.Errorf("verified token but could not fetch user info: %w", err)
	}

	log.Printf("Successfully verified and fetched user: %s (%s)\n", user.Email, user.ID)
	return &user, nil
}
