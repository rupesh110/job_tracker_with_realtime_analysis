# ---------- Stage 1: Build ----------
FROM golang:1.22-alpine AS builder

# Set up build env
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o backend main.go

# ---------- Stage 2: Run ----------
# Use distroless (preferred for Cloud Run) OR Alpine if you need shell tools
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app
COPY --from=builder /app/backend .
COPY --from=builder /app/docs ./docs

# Cloud Run injects PORT automatically
ENV PORT=8080
EXPOSE 8080

USER nonroot:nonroot
ENTRYPOINT ["/app/backend"]
