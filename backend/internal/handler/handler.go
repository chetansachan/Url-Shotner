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

import "net/http"

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/shorten", h.shorten)
	mux.HandleFunc("GET /r/{code}", h.redirect)
	mux.HandleFunc("GET /api/urls/{code}", h.stats)
	mux.HandleFunc("GET /healthz", h.health)
	return mux
}

func (h *Handler) shorten(w http.ResponseWriter, r *http.Request) {
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		ip = r.RemoteAddr
	}
	allowed, _ := h.cache.Allow(r.Context(), ip, shortenRateLimit, time.Minute)
	if !allowed {
		http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
		return
	}
}
