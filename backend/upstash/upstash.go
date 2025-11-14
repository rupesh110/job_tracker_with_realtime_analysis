package upstash

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type UpstashClient struct {
	URL   string
	Token string
}

func New(url, token string) *UpstashClient {
	// sanitize token
	token = strings.TrimSpace(token)
	token = strings.Trim(token, "\"")
	token = strings.ReplaceAll(token, "\n", "")
	token = strings.ReplaceAll(token, "\r", "")
	token = strings.ReplaceAll(token, "\t", "")

	fmt.Printf("TOKEN DEBUG BYTES IN CLOUD RUN: %q\n", token)

	return &UpstashClient{
		URL:   strings.TrimSpace(url),
		Token: token,
	}
}

func (c *UpstashClient) Post(path string, body any) (map[string]any, error) {
	var buf []byte
	if body != nil {
		buf, _ = json.Marshal(body)
	}

	req, err := http.NewRequest("POST", c.URL+path, bytes.NewBuffer(buf))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	var result map[string]any
	json.NewDecoder(resp.Body).Decode(&result)

	return result, nil
}
