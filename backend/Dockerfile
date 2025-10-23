# --- Stage 1: Build ---
FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o backend main.go

# --- Stage 2: Run ---
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/backend .
RUN chmod +x ./backend

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "./backend"]
