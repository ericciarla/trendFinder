/*
  Warnings:

  - A unique constraint covering the columns `[service]` on the table `ApiKeys` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApiKeys_service_key" ON "ApiKeys"("service");
