import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Lead } from "../leads/lead.entity";
import { Task } from "../tasks/task.entity";
import { User } from "../users/user.entity";

import { OrganizationType, OrganizationStatus } from "./organization.types";

@Entity({ name: "organizations" })
@Index("idx_organizations_name", ["name"])
@Index("idx_organizations_status", ["status"])
@Index("idx_organizations_owner_id", ["ownerId"])
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  name!: string;

  @Column({
    name: "legal_name",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  legalName!: string | null;

  @Column({
    name: "organization_type",
    type: "enum",
    enum: OrganizationType,
    enumName: "organization_type_enum",
    default: OrganizationType.CORPORATION,
  })
  organizationType!: OrganizationType;

  @Column({
    type: "enum",
    enum: OrganizationStatus,
    enumName: "organization_status_enum",
    default: OrganizationStatus.PROSPECT,
  })
  status!: OrganizationStatus;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  industry!: string | null;

  @Column({
    type: "varchar",
    length: 500,
    nullable: true,
  })
  website!: string | null;

  @Column({
    type: "varchar",
    length: 320,
    nullable: true,
  })
  email!: string | null;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
  })
  phone!: string | null;

  @Column({
    name: "annual_revenue",
    type: "numeric",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  annualRevenue!: string | null;

  @Column({
    name: "employee_count",
    type: "integer",
    nullable: true,
  })
  employeeCount!: number | null;

  @Column({
    name: "tax_identification_number",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  taxIdentificationNumber!: string | null;

  @Column({
    name: "registration_number",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  registrationNumber!: string | null;

  @Column({
    name: "address_line_1",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  addressLine1!: string | null;

  @Column({
    name: "address_line_2",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  addressLine2!: string | null;

  @Column({
    type: "varchar",
    length: 150,
    nullable: true,
  })
  city!: string | null;

  @Column({
    name: "state_province",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  stateProvince!: string | null;

  @Column({
    name: "postal_code",
    type: "varchar",
    length: 30,
    nullable: true,
  })
  postalCode!: string | null;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
  })
  country!: string | null;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: "logo_url",
    type: "text",
    nullable: true,
  })
  logoUrl!: string | null;

  @Column({
    name: "owner_id",
    type: "uuid",
  })
  ownerId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @Column({
    name: "created_by_id",
    type: "uuid",
  })
  createdById!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "created_by_id" })
  createdBy!: User;

  @Column({
    name: "updated_by_id",
    type: "uuid",
    nullable: true,
  })
  updatedById!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "updated_by_id" })
  updatedBy!: User | null;

  @OneToMany(() => Lead, (lead) => lead.organization)
  leads!: Lead[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks!: Task[];

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt!: Date;
}