package config

import (
	"backend/queries"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var DB *sql.DB

func InitDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL not found")
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	db.SetMaxOpenConns(50)                 // total concurrent connections allowed
	db.SetMaxIdleConns(25)                 // idle connections kept alive
	db.SetConnMaxLifetime(5 * time.Minute) // recycle connections every 5 mins
	db.SetConnMaxIdleTime(2 * time.Minute) // optional: close long-idle conns

	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	DB = db

	if _, err := DB.Exec(queries.CreateTableTestItems); err != nil {
		log.Fatal("Failed to create test_items table:", err)
	}

	if _, err := DB.Exec(queries.CreateJobsItems); err != nil {
		log.Fatal("Failed to create jobs table:", err)
	}

	if _, err := DB.Exec(queries.CreateUsersTable); err != nil {
		log.Fatal("Failed to create users table:", err)
	}

	if _, err := DB.Exec(queries.CreateRateLimitsTable); err != nil {
		log.Fatal("Failed to create rate_limits table:", err)

	}

	log.Println("Database initialized successfully")
}

func CloseDB() {
	if DB != nil {
		DB.Close()
		fmt.Println("Database connection closed")
	}
}
