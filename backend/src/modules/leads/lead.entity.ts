import {
  Check,
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

import { Organization } from "../organizations/organization.entity";
import { Pipeline } from "../pipelines/pipeline.entity";
import { Task } from "../tasks/task.entity";
import { User } from "../users/user.entity";

import { LeadStatus, LeadInterestLevel } from "./lead.types";

@Entity({ name: "leads" })
@Index("idx_leads_email", ["email"])
@Index("idx_leads_status", ["status"])
@Index("idx_leads_owner_id", ["ownerId"])
@Index("idx_leads_assigned_to_id", ["assignedToId"])
@Index("idx_leads_organization_id", ["organizationId"])
@Index("idx_leads_pipeline_id", ["pipelineId"])
@Index("idx_leads_pipeline_stage_id", ["pipelineStageId"])
@Check(`"pipeline_progress" >= 0 AND "pipeline_progress" <= 100`)
export class Lead {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "first_name",
    type: "varchar",
    length: 150,
  })
  firstName!: string;

  @Column({
    name: "last_name",
    type: "varchar",
    length: 150,
  })
  lastName!: string;

  @Column({
    name: "avatar_url",
    type: "text",
    nullable: true,
  })
  avatarUrl!: string | null;

  @Column({
    type: "varchar",
    length: 320,
  })
  email!: string;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
  })
  phone!: string | null;

  @Column({
    name: "job_title",
    type: "varchar",
    length: 200,
    nullable: true,
  })
  jobTitle!: string | null;

  @Column({
    name: "company_name",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  companyName!: string | null;

  @Column({
    name: "annual_revenue",
    type: "numeric",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  annualRevenue!: string | null;

  @Column({
    type: "varchar",
    length: 150,
    nullable: true,
  })
  source!: string | null;

  @Column({
    type: "enum",
    enum: LeadStatus,
    enumName: "lead_status_enum",
    default: LeadStatus.NEW,
  })
  status!: LeadStatus;

  @Column({
    name: "interest_level",
    type: "enum",
    enum: LeadInterestLevel,
    enumName: "lead_interest_level_enum",
    default: LeadInterestLevel.LOW,
  })
  interestLevel!: LeadInterestLevel;

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
    name: "last_activity_at",
    type: "timestamptz",
    nullable: true,
  })
  lastActivityAt!: Date | null;

  @Column({
    name: "organization_id",
    type: "uuid",
    nullable: true,
  })
  organizationId!: string | null;

  @ManyToOne(
    () => Organization,
    (organization) => organization.leads,
    {
      nullable: true,
      onDelete: "SET NULL",
    },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization | null;

  @Column({
    name: "pipeline_id",
    type: "uuid",
    nullable: true,
  })
  pipelineId!: string | null;

  @ManyToOne(() => Pipeline, (pipeline) => pipeline.leads, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "pipeline_id" })
  pipeline!: Pipeline | null;

  @Column({
    name: "pipeline_stage_id",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  pipelineStageId!: string | null;

  @Column({
    name: "pipeline_position",
    type: "integer",
    default: 0,
  })
  pipelinePosition!: number;

  @Column({
    name: "pipeline_progress",
    type: "smallint",
    default: 0,
  })
  pipelineProgress!: number;

  @Column({
    name: "entered_stage_at",
    type: "timestamptz",
    nullable: true,
  })
  enteredStageAt!: Date | null;

  @Column({
    name: "owner_id",
    type: "uuid",
  })
  ownerId!: string;

  @ManyToOne(
    () => User,
    (user) => user.ownedLeads,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @Column({
    name: "assigned_to_id",
    type: "uuid",
    nullable: true,
  })
  assignedToId!: string | null;

  @ManyToOne(
    () => User,
    (user) => user.assignedLeads,
    {
      nullable: true,
      onDelete: "SET NULL",
    },
  )
  @JoinColumn({ name: "assigned_to_id" })
  assignedTo!: User | null;

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

  @OneToMany(() => Task, (task) => task.lead)
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