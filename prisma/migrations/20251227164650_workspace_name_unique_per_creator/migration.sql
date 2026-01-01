/*
  Warnings:

  - A unique constraint covering the columns `[created_by,name]` on the table `workspaces` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workspaces_created_by_name_key" ON "workspaces"("created_by", "name");
