-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mxeTag" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "transactionRef" TEXT NOT NULL,
    "flwRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VirtualAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_beneficiaries" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_email_key" ON "Wallet"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccount_email_key" ON "VirtualAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccount_accountNumber_key" ON "VirtualAccount"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "_beneficiaries_AB_unique" ON "_beneficiaries"("A", "B");

-- CreateIndex
CREATE INDEX "_beneficiaries_B_index" ON "_beneficiaries"("B");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_email_fkey" FOREIGN KEY ("email") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualAccount" ADD CONSTRAINT "VirtualAccount_email_fkey" FOREIGN KEY ("email") REFERENCES "Wallet"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_beneficiaries" ADD CONSTRAINT "_beneficiaries_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_beneficiaries" ADD CONSTRAINT "_beneficiaries_B_fkey" FOREIGN KEY ("B") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
