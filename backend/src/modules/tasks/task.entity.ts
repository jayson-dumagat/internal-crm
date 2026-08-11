import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Lead } from "../leads/lead.entity";
import { Organization } from "../organizations/organization.entity";
import { User } from "../users/user.entity";

export enum TaskStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  OVERDUE = "overdue",
  BLOCKED = "blocked",
}

export enum TaskKind {
  TASK = "task",
  EVENT = "event",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum TaskType {
  GENERAL = "general",
  CALL = "call",
  EMAIL = "email",
  MEETING = "meeting",
  FOLLOW_UP = "follow_up",
  DOCUMENT = "document",
  REVIEW = "review",
}

@Entity({ name: "tasks" })
@Index("idx_tasks_kind", ["kind"])
@Index("idx_tasks_status", ["status"])
@Index("idx_tasks_priority", ["priority"])
@Index("idx_tasks_due_at", ["dueAt"])
@Index("idx_tasks_assignee_id", ["assigneeId"])
@Index("idx_tasks_lead_id", ["leadId"])
@Index("idx_tasks_organization_id", ["organizationId"])
@Index("idx_tasks_tenant_id", ["tenantId"])
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  title!: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: "varchar",
    length: 20,
    default: TaskKind.TASK,
  })
  kind!: TaskKind;

  @Column({
    type: "enum",
    enum: TaskType,
    enumName: "task_type_enum",
    default: TaskType.GENERAL,
  })
  type!: TaskType;

  @Column({
    type: "enum",
    enum: TaskStatus,
    enumName: "task_status_enum",
    default: TaskStatus.NOT_STARTED,
  })
  status!: TaskStatus;

  @Column({
    type: "enum",
    enum: TaskPriority,
    enumName: "task_priority_enum",
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    type: "varchar",
    length: 20,
    nullable: true,
  })
  color!: string | null;

  @Column({
    name: "start_at",
    type: "timestamptz",
    nullable: true,
  })
  startAt!: Date | null;

  @Column({
    name: "due_at",
    type: "timestamptz",
    nullable: true,
  })
  dueAt!: Date | null;

  @Column({
    name: "completed_at",
    type: "timestamptz",
    nullable: true,
  })
  completedAt!: Date | null;

  @Column({
    name: "reminder_at",
    type: "timestamptz",
    nullable: true,
  })
  reminderAt!: Date | null;

  @Column({
    name: "is_reminder_sent",
    type: "boolean",
    default: false,
  })
  isReminderSent!: boolean;

  @Column({
    name: "assignee_id",
    type: "uuid",
    nullable: true,
  })
  assigneeId!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "assignee_id" })
  assignee!: User | null;

  @Column({
    name: "lead_id",
    type: "uuid",
    nullable: true,
  })
  leadId!: string | null;

  @ManyToOne(() => Lead, (lead) => lead.tasks, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "lead_id" })
  lead!: Lead | null;

  @Column({
    name: "organization_id",
    type: "uuid",
    nullable: true,
  })
  organizationId!: string | null;

  @ManyToOne(
    () => Organization,
    (organization) => organization.tasks,
    {
      nullable: true,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization | null;

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
    name: "completed_by_id",
    type: "uuid",
    nullable: true,
  })
  completedById!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "completed_by_id" })
  completedBy!: User | null;

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
