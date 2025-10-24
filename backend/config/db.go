package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

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

	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	DB = db
	fmt.Println("✅ Database connection established")

	query := `
	CREATE TABLE IF NOT EXISTS test_items (
		id SERIAL PRIMARY KEY,
		title TEXT NOT NULL,
		note TEXT
	);`
	if _, err := DB.Exec(query); err != nil {
		log.Fatal("Failed to create test_items table:", err)
	}
}

func CloseDB() {
	if DB != nil {
		DB.Close()
		fmt.Println("🧹 Database connection closed")
	}
}
