package config

import (
	"os"
	"time"
)

type Config struct {
	DatabaseURL   string
	RedisAddr     string
	FlushInterval time.Duration
	ListenAddr    string
}

func Load() Config {
	duration, err := time.ParseDuration(getEnv("FLUSH_INTERVAL", "30s"))
	if err != nil {
		duration = 30 * time.Second
	}
	return Config{
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://postgres:chetan156@localhost:5432/url-shotner?sslmode=disable"),
		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		FlushInterval: duration,
		ListenAddr:    getEnv("LISTEN_ADDR", ":8080"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
