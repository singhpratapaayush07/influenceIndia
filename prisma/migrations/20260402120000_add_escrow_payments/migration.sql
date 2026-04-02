-- CreateTable
CREATE TABLE "escrow_payments" (
    "id" TEXT NOT NULL,
    "contactRequestId" TEXT NOT NULL,
    "brandUserId" TEXT NOT NULL,
    "influencerUserId" TEXT NOT NULL,
    "amountInr" INTEGER NOT NULL,
    "platformFeeInr" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "deliverableProof" TEXT,
    "disputeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escrow_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "escrow_payments_contactRequestId_idx" ON "escrow_payments"("contactRequestId");

-- CreateIndex
CREATE INDEX "escrow_payments_brandUserId_idx" ON "escrow_payments"("brandUserId");

-- CreateIndex
CREATE INDEX "escrow_payments_influencerUserId_idx" ON "escrow_payments"("influencerUserId");

-- CreateIndex
CREATE INDEX "escrow_payments_status_idx" ON "escrow_payments"("status");

-- AddForeignKey
ALTER TABLE "escrow_payments" ADD CONSTRAINT "escrow_payments_contactRequestId_fkey" FOREIGN KEY ("contactRequestId") REFERENCES "contact_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_payments" ADD CONSTRAINT "escrow_payments_brandUserId_fkey" FOREIGN KEY ("brandUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_payments" ADD CONSTRAINT "escrow_payments_influencerUserId_fkey" FOREIGN KEY ("influencerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
