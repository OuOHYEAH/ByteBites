package main

import (
	"net"
	"os"

	"github.com/CallenCaracy/ByteBites/services/Payment_Service/pb"
	payment "github.com/CallenCaracy/ByteBites/services/Payment_Service/server/payments"
	"github.com/CallenCaracy/ByteBites/services/Payment_Service/utils"

	"google.golang.org/grpc"
)

func main() {
	log, err := utils.NewLogger()
	if err != nil {
		os.Exit(1)
	}

		port := os.Getenv("PORT")
	if port == "" {
		port = "50054" // Fallback for local development
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatal("Failed to listen: %v", err)
		os.Exit(1)
	}

	grpcServer := grpc.NewServer()

	paymentService := &payment.PaymentServiceServer{}

	pb.RegisterPaymentServiceServer(grpcServer, paymentService)

	log.Info("Order Service running on port 50054...")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal("Failed to serve: %v", err)
		os.Exit(1)
	}
}
