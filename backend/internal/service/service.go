package service

import (
	"context"
	"errors"
	"log"
	"net/url"
	"regexp"

	"url-shotner/internal/shortcode"
	"url-shotner/internal/store"
)

var (
	ErrInvalidURL = errors.New("invalid url")
	ErrNotFound   = errors.New("not found")
)

var validCode = regexp.MustCompile(`^[a-zA-Z0-9]{1,10}$`)

const (
	maxURLLength = 2048
	maxRetries   = 3
)

type Service struct {
	repo  *store.URLRepo
	cache *store.Cache
}

func New(repo *store.URLRepo, cache *store.Cache) *Service {
	return &Service{repo: repo, cache: cache}
}

func (s *Service) Shorten(ctx context.Context, raw string) (string, error) {
	if len(raw) > maxURLLength {
		return "", ErrInvalidURL
	}
	u, err := url.ParseRequestURI(raw)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
		return "", ErrInvalidURL
	}

	for range maxRetries {
		code, err := shortcode.New()
		if err != nil {
			return "", err
		}
		err = s.repo.Insert(ctx, code, raw)
		if errors.Is(err, store.ErrCodeTaken) {
			continue
		}
		if err != nil {
			return "", err
		}
		if err := s.cache.SetURL(ctx, code, raw); err != nil { // pre-warm
			log.Printf("cache pre-warm failed for %s: %v", code, err)
		}
		return code, nil
	}
	return "", errors.New("could not generate a unique short code")
}

// Resolve implements the cache-aside read path. Redis errors are treated
// as misses so redirects keep working when Redis is down.
func (s *Service) Resolve(ctx context.Context, code string) (string, error) {
	if !validCode.MatchString(code) {
		return "", ErrNotFound
	}

	target, found, err := s.cache.GetURL(ctx, code)
	if err != nil {
		log.Printf("cache get failed for %s: %v (treating as miss)", code, err)
	} else if found {
		if target == store.NotFoundMarker {
			return "", ErrNotFound
		}
		if err := s.cache.IncrClick(ctx, code); err != nil {
			log.Printf("click incr failed for %s: %v", code, err)
		}
		return target, nil
	}

	row, err := s.repo.GetByCode(ctx, code)
	if errors.Is(err, store.ErrNotFound) {
		if err := s.cache.SetNotFound(ctx, code); err != nil {
			log.Printf("negative cache set failed for %s: %v", code, err)
		}
		return "", ErrNotFound
	}
	if err != nil {
		return "", err
	}

	if err := s.cache.SetURL(ctx, code, row.OriginalURL); err != nil {
		log.Printf("cache set failed for %s: %v", code, err)
	}
	if err := s.cache.IncrClick(ctx, code); err != nil {
		log.Printf("click incr failed for %s: %v", code, err)
	}
	return row.OriginalURL, nil
}

// Stats returns the row from Postgres with the unflushed Redis counter
// added on top of the persisted click_count.
func (s *Service) Stats(ctx context.Context, code string) (store.URLRow, error) {
	row, err := s.repo.GetByCode(ctx, code)
	if err != nil {
		return row, err
	}
	pending, err := s.cache.PendingClicks(ctx, code)
	if err != nil {
		log.Printf("pending clicks read failed for %s: %v", code, err)
		pending = 0
	}
	row.ClickCount += pending
	return row, nil
}
