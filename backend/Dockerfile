# --- Stage 1: Build ---
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the app source code
COPY . .

# Build the binary
RUN go build -o backend main.go

# --- Stage 2: Run ---
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the compiled binary
COPY --from=builder /app/backend .

# Expose port 8080 (Cloud Run injects PORT automatically)
EXPOSE 8080

# Start the server
CMD ["./backend"]
