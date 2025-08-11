import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1700000000000 implements MigrationInterface {
  name = 'CreateInitialTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create farmers table
    await queryRunner.query(`
      CREATE TABLE "farmers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "cpf" character varying,
        "cnpj" character varying,
        "name" character varying NOT NULL,
        CONSTRAINT "UQ_farmers_cpf" UNIQUE ("cpf"),
        CONSTRAINT "UQ_farmers_cnpj" UNIQUE ("cnpj"),
        CONSTRAINT "PK_farmers_id" PRIMARY KEY ("id")
      )
    `);

    // Create farms table
    await queryRunner.query(`
      CREATE TABLE "farms" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "city" character varying NOT NULL,
        "state" character varying NOT NULL,
        "totalArea" numeric(10,2) NOT NULL,
        "cultivationArea" numeric(10,2) NOT NULL,
        "vegetationArea" numeric(10,2) NOT NULL,
        "farmerId" uuid NOT NULL,
        CONSTRAINT "PK_farms_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_farms_farmerId" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE
      )
    `);

    // Create harvests table
    await queryRunner.query(`
      CREATE TABLE "harvests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "year" integer NOT NULL,
        "farmId" uuid NOT NULL,
        CONSTRAINT "PK_harvests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_harvests_farmId" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE
      )
    `);

    // Create crops table
    await queryRunner.query(`
      CREATE TABLE "crops" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "harvestId" uuid NOT NULL,
        CONSTRAINT "PK_crops_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_crops_harvestId" FOREIGN KEY ("harvestId") REFERENCES "harvests"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_farmers_cpf" ON "farmers" ("cpf")`);
    await queryRunner.query(`CREATE INDEX "IDX_farmers_cnpj" ON "farmers" ("cnpj")`);
    await queryRunner.query(`CREATE INDEX "IDX_farms_farmerId" ON "farms" ("farmerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_harvests_farmId" ON "harvests" ("farmId")`);
    await queryRunner.query(`CREATE INDEX "IDX_crops_harvestId" ON "crops" ("harvestId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "crops"`);
    await queryRunner.query(`DROP TABLE "harvests"`);
    await queryRunner.query(`DROP TABLE "farms"`);
    await queryRunner.query(`DROP TABLE "farmers"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}

