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
