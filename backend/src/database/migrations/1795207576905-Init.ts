import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1795207576905 implements MigrationInterface {
    name = 'Init1795207576905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Extensiones necesarias (ubicaciones geograficas y uuids)
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."users_tipo_enum" AS ENUM('cliente', 'tecnico', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tipo" "public"."users_tipo_enum" NOT NULL, "nombre" character varying NOT NULL, "email" character varying NOT NULL, "telefono" character varying, "password_hash" character varying NOT NULL, "foto_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "icono" character varying, "activo" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_c6975327790a99daa8b254efd55" UNIQUE ("nombre"), CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."technician_profiles_antecedentes_status_enum" AS ENUM('pendiente', 'aprobado', 'rechazado')`);
        await queryRunner.query(`CREATE TABLE "technician_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "dni" character varying NOT NULL, "direccion" character varying NOT NULL, "antecedentes_status" "public"."technician_profiles_antecedentes_status_enum" NOT NULL DEFAULT 'pendiente', "radio_cobertura_km" double precision NOT NULL DEFAULT '5', "ubicacion" geography(Point,4326), "calificacion_promedio" double precision NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_328f93227e883c577337c6a955" UNIQUE ("user_id"), CONSTRAINT "PK_b8b333b43558d1423241cb4924e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_estado_enum" AS ENUM('pendiente', 'aceptado', 'en_progreso', 'finalizado', 'cancelado')`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_estado_pago_enum" AS ENUM('pendiente', 'pagado')`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cliente_id" uuid NOT NULL, "technician_profile_id" uuid NOT NULL, "service_category_id" uuid NOT NULL, "estado" "public"."jobs_estado_enum" NOT NULL DEFAULT 'pendiente', "descripcion" text NOT NULL, "direccion_trabajo" character varying NOT NULL, "precio_acordado" numeric(10,2), "estado_pago" "public"."jobs_estado_pago_enum" NOT NULL DEFAULT 'pendiente', "metodo_pago" character varying, "fecha_inicio" TIMESTAMP, "fecha_fin" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "sender_id" uuid NOT NULL, "contenido" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ratings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "puntaje" integer NOT NULL, "comentario" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "job_id" uuid NOT NULL, "author_id" uuid NOT NULL, "target_id" uuid NOT NULL, CONSTRAINT "UQ_d6092f5fdb65c84767d3edbc368" UNIQUE ("job_id", "author_id"), CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "technician_categories" ("technician_profile_id" uuid NOT NULL, "service_category_id" uuid NOT NULL, CONSTRAINT "PK_f693fb5423b6a3688b5d335ccdb" PRIMARY KEY ("technician_profile_id", "service_category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8483f686bea835385bca96da26" ON "technician_categories"  ("technician_profile_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c54171646b81e8bb13ee49d596" ON "technician_categories"  ("service_category_id") `);
        await queryRunner.query(`ALTER TABLE "technician_profiles" ADD CONSTRAINT "FK_328f93227e883c577337c6a9551" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_6e89f7a347012b4c6b272f2b4d0" FOREIGN KEY ("cliente_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_34c9e6ea4dfd54cb432c31f9916" FOREIGN KEY ("technician_profile_id") REFERENCES "technician_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_3fac1bcc0596809fd3e2e22dd24" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_54ac2cd0bf6f11e0e85bc3ddf80" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_77e54384258e12a34faa920196d" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_130658ef235354aaad126c093f7" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_0b452e075de225548a5515e4cc0" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "technician_categories" ADD CONSTRAINT "FK_8483f686bea835385bca96da26d" FOREIGN KEY ("technician_profile_id") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "technician_categories" ADD CONSTRAINT "FK_c54171646b81e8bb13ee49d5966" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "technician_categories" DROP CONSTRAINT "FK_c54171646b81e8bb13ee49d5966"`);
        await queryRunner.query(`ALTER TABLE "technician_categories" DROP CONSTRAINT "FK_8483f686bea835385bca96da26d"`);
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_0b452e075de225548a5515e4cc0"`);
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_130658ef235354aaad126c093f7"`);
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_77e54384258e12a34faa920196d"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_54ac2cd0bf6f11e0e85bc3ddf80"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_3fac1bcc0596809fd3e2e22dd24"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_34c9e6ea4dfd54cb432c31f9916"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_6e89f7a347012b4c6b272f2b4d0"`);
        await queryRunner.query(`ALTER TABLE "technician_profiles" DROP CONSTRAINT "FK_328f93227e883c577337c6a9551"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c54171646b81e8bb13ee49d596"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8483f686bea835385bca96da26"`);
        await queryRunner.query(`DROP TABLE "technician_categories"`);
        await queryRunner.query(`DROP TABLE "ratings"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_estado_pago_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_estado_enum"`);
        await queryRunner.query(`DROP TABLE "technician_profiles"`);
        await queryRunner.query(`DROP TYPE "public"."technician_profiles_antecedentes_status_enum"`);
        await queryRunner.query(`DROP TABLE "service_categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_tipo_enum"`);
    }

}
