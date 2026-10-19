package shortcode

import "crypto/rand"

const (
	alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	Length   = 7
)

// New returns a cryptographically random Base62 code.
func New() (string, error) {
	buf := make([]byte, Length)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	code := make([]byte, Length)
	for i, b := range buf {
		code[i] = alphabet[int(b)%len(alphabet)]
	}
	return string(code), nil
}
