package worker

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/redis/go-redis/v9"

	"url-shotner/internal/store"
)

type Flusher struct {
	repo  *store.URLRepo
	cache *store.Cache
}

func New(repo *store.URLRepo, cache *store.Cache) *Flusher {
	return &Flusher{repo: repo, cache: cache}
}

// Run flushes on every tick until ctx is cancelled.
func (f *Flusher) Run(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := f.FlushOnce(ctx); err != nil {
				log.Printf("flush failed: %v", err)
			}
		}
	}
}

// FlushOnce drains all dirty click counters into Postgres.
//
// Ordering matters: the code is removed from the dirty set BEFORE
// GETDEL reads the counter. If a click lands in between, its SADD
// simply re-adds the code for the next flush instead of leaving an
// orphaned counter. If the Postgres update fails, the counts are
// restored with INCRBY so nothing is lost.
func (f *Flusher) FlushOnce(ctx context.Context) error {
	codes, err := f.cache.DirtyCodes(ctx)
	if err != nil {
		return err
	}
	for _, code := range codes {
		if err := f.cache.RemoveDirty(ctx, code); err != nil {
			log.Printf("flush: remove dirty %s: %v", code, err)
			continue
		}
		n, err := f.cache.GetDelClicks(ctx, code)
		if errors.Is(err, redis.Nil) {
			continue
		}
		if err != nil {
			log.Printf("flush: getdel %s: %v", code, err)
			continue
		}
		if err := f.repo.AddClicks(ctx, code, n); err != nil {
			log.Printf("flush: update %s failed, restoring %d clicks: %v", code, n, err)
			if err := f.cache.RestoreClicks(ctx, code, n); err != nil {
				log.Printf("flush: restore %s failed, %d clicks lost: %v", code, n, err)
			}
		}
	}
	return nil
}
