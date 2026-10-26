package handler

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"

	"url-shotner/internal/service"
	"url-shotner/internal/store"
)

const shortenRateLimit = 10

type Handler struct {
	svc   *service.Service
	cache *store.Cache
	pool  *pgxpool.Pool
	rdb   *redis.Client
}

func New(svc *service.Service, cache *store.Cache, pool *pgxpool.Pool, rdb *redis.Client) *Handler {
	return &Handler{svc: svc, cache: cache, pool: pool, rdb: rdb}
}
