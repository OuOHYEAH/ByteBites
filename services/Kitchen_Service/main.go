package main

import (
	"net"
	"os"

	"github.com/CallenCaracy/ByteBites/services/Kitchen_Service/pb"
	kitchen "github.com/CallenCaracy/ByteBites/services/Kitchen_Service/server/kitchen"
	"github.com/CallenCaracy/ByteBites/services/Kitchen_Service/utils"

	"google.golang.org/grpc"
)

func main() {
	log, err := utils.NewLogger()
	if err != nil {
		os.Exit(1)
	}

		port := os.Getenv("PORT")
	if port == "" {
		port = "50052" // Fallback for local development
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatal("Failed to listen: %v", err)
		os.Exit(1)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterKitchenServiceServer(grpcServer, &kitchen.KitchenServiceServer{})

	//Here you call your generated proto
	// Make an .env file for private api supabase connection
	// to run: go run main.go

	log.Info("Kitchen Service running on port 50052...")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal("Failed to serve: %v", err)
		os.Exit(1)
	}
}
