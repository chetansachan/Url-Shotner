package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrCodeTaken = errors.New("short code already taken")
	ErrNotFound  = errors.New("not found")
)

type URLRow struct {
	ShortCode   string    `json:"short_code"`
	OriginalURL string    `json:"original_url"`
	ClickCount  int64     `json:"click_count"`
	CreatedAt   time.Time `json:"created_at"`
}

type URLRepo struct {
	pool *pgxpool.Pool
}

func NewURLRepo(pool *pgxpool.Pool) *URLRepo {
	return &URLRepo{pool: pool}
}

func (r *URLRepo) Insert(ctx context.Context, code, target string) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO urls (short_code, original_url) VALUES ($1, $2)`, code, target)
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return ErrCodeTaken
	}
	return err
}

func (r *URLRepo) GetByCode(ctx context.Context, code string) (URLRow, error) {
	var row URLRow
	err := r.pool.QueryRow(ctx,
		`SELECT short_code, original_url, click_count, created_at
		 FROM urls WHERE short_code = $1`, code).
		Scan(&row.ShortCode, &row.OriginalURL, &row.ClickCount, &row.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return row, ErrNotFound
	}
	return row, err
}

func (r *URLRepo) AddClicks(ctx context.Context, code string, n int64) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE urls SET click_count = click_count + $2 WHERE short_code = $1`, code, n)
	return err
}
