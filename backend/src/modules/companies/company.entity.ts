import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "companies" })
@Index("idx_companies_name", ["name"])
@Index("idx_companies_status", ["status"])
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "varchar", length: 150, nullable: true })
  tenantId!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  industry!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  location!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  employees!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  revenue!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  website!: string | null;

  @Column({ name: "customer_since", type: "date", nullable: true })
  customerSince!: string | null;

  @Column({ type: "text", array: true, default: "{}" })
  tags!: string[];

  @Column({ type: "varchar", length: 30, default: "Prospect" })
  status!: string;

  @Column({ name: "logo_url", type: "text", nullable: true })
  logoUrl!: string | null;

  @Column({
    name: "logo_content_type",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  logoContentType!: string | null;

  @Column({
    name: "created_by_id",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  createdById!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
