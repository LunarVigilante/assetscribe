-- CreateTable
CREATE TABLE "asset_related_links" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "link_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_related_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_relationships" (
    "id" SERIAL NOT NULL,
    "parent_asset_id" INTEGER NOT NULL,
    "child_asset_id" INTEGER NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_relationships_parent_asset_id_child_asset_id_relation_key" ON "asset_relationships"("parent_asset_id", "child_asset_id", "relationship_type");

-- AddForeignKey
ALTER TABLE "asset_related_links" ADD CONSTRAINT "asset_related_links_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_relationships" ADD CONSTRAINT "asset_relationships_parent_asset_id_fkey" FOREIGN KEY ("parent_asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_relationships" ADD CONSTRAINT "asset_relationships_child_asset_id_fkey" FOREIGN KEY ("child_asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
