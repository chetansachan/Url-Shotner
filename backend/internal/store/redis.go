package store

import (
	"context"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	URLTTL      = time.Hour
	NotFoundTTL = time.Minute

	// NotFoundMarker is the sentinel value cached for codes that don't
	// exist in Postgres (negative caching).
	NotFoundMarker = "__NOT_FOUND__"

	dirtySetKey = "clicks:dirty"
)

type Cache struct {
	rdb *redis.Client
}

func NewCache(rdb *redis.Client) *Cache {
	return &Cache{rdb: rdb}
}

// GetURL returns (value, found, err). found is false on a real cache miss
// and when Redis itself errors (treated as a miss by callers). The value
// may be NotFoundMarker.
func (c *Cache) GetURL(ctx context.Context, code string) (string, bool, error) {
	v, err := c.rdb.Get(ctx, "url:"+code).Result()
	if errors.Is(err, redis.Nil) {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return v, true, nil
}

func (c *Cache) SetURL(ctx context.Context, code, target string) error {
	return c.rdb.Set(ctx, "url:"+code, target, URLTTL).Err()
}

func (c *Cache) SetNotFound(ctx context.Context, code string) error {
	return c.rdb.Set(ctx, "url:"+code, NotFoundMarker, NotFoundTTL).Err()
}

// IncrClick bumps the click counter and marks the code dirty in one
// round trip via a pipeline.
func (c *Cache) IncrClick(ctx context.Context, code string) error {
	pipe := c.rdb.Pipeline()
	pipe.Incr(ctx, "clicks:"+code)
	pipe.SAdd(ctx, dirtySetKey, code)
	_, err := pipe.Exec(ctx)
	return err
}

// PendingClicks returns the not-yet-flushed click count for a code
// (0 if none are pending).
func (c *Cache) PendingClicks(ctx context.Context, code string) (int64, error) {
	n, err := c.rdb.Get(ctx, "clicks:"+code).Int64()
	if errors.Is(err, redis.Nil) {
		return 0, nil
	}
	return n, err
}

// Allow implements a fixed-window rate limit with INCR + EXPIRE.
// On a Redis error it fails open (allows the request).
func (c *Cache) Allow(ctx context.Context, key string, limit int64, window time.Duration) (bool, error) {
	k := "rl:" + key
	n, err := c.rdb.Incr(ctx, k).Result()
	if err != nil {
		return true, err
	}
	if n == 1 {
		if err := c.rdb.Expire(ctx, k, window).Err(); err != nil {
			return true, err
		}
	}
	return n <= limit, nil
}

// DirtyCodes lists every code with unflushed clicks.
func (c *Cache) DirtyCodes(ctx context.Context) ([]string, error) {
	return c.rdb.SMembers(ctx, dirtySetKey).Result()
}

// RemoveDirty drops a code from the dirty set. Called BEFORE GetDelClicks
// so a click racing the flush re-adds the code instead of orphaning it.
func (c *Cache) RemoveDirty(ctx context.Context, code string) error {
	return c.rdb.SRem(ctx, dirtySetKey, code).Err()
}

// GetDelClicks atomically reads and deletes a counter.
// Returns redis.Nil if no counter exists.
func (c *Cache) GetDelClicks(ctx context.Context, code string) (int64, error) {
	return c.rdb.GetDel(ctx, "clicks:"+code).Int64()
}

// RestoreClicks puts counts back after a failed Postgres update.
func (c *Cache) RestoreClicks(ctx context.Context, code string, n int64) error {
	pipe := c.rdb.Pipeline()
	pipe.IncrBy(ctx, "clicks:"+code, n)
	pipe.SAdd(ctx, dirtySetKey, code)
	_, err := pipe.Exec(ctx)
	return err
}
