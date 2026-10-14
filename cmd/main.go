package main

import (
	"log"
	"net/http"
	"url-shotner/internal/config"
	"url-shotner/internal/database"
)

func main() {
	cfg := config.Load()
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	db, err := database.Connect(cfg.DatabaseUrl)
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	log.Printf("Server listening on port %v ...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Error starting server %v", err)
	}

}
