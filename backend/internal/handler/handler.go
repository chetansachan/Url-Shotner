package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net"
	"net/http"
	"time"

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
	allowed, err := h.cache.Allow(r.Context(), ip, shortenRateLimit, time.Minute)
	if err != nil {
		log.Printf("rate limiter error: %v", err)
	}
	if !allowed {
		http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
		return
	}

	var req struct {
		URL string `json:"url"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 8192)).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	code, err := h.svc.Shorten(r.Context(), req.URL)
	if err != nil {
		if errors.Is(err, service.ErrInvalidURL) {
			http.Error(w, "invalid url: must be a valid http(s) URL", http.StatusBadRequest)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"short_code": code,
		"short_url":  "http://" + r.Host + "/r/" + code,
	})
}

func (h *Handler) redirect(w http.ResponseWriter, r *http.Request) {
	target, err := h.svc.Resolve(r.Context(), r.PathValue("code"))
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			http.NotFound(w, r)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, target, http.StatusFound)
}
