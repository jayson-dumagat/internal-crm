import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "activities" })
@Index("idx_activities_tenant_created_at", ["tenantId", "createdAt"])
@Index("idx_activities_category", ["category"])
export class Activity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ name: "actor_id", type: "uuid", nullable: true })
  actorId!: string | null;

  @Column({ name: "actor_name", type: "varchar", length: 255 })
  actorName!: string;

  @Column({ name: "actor_avatar_url", type: "text", nullable: true })
  actorAvatarUrl!: string | null;

  @Column({ type: "text" })
  action!: string;

  @Column({ type: "text" })
  target!: string;

  @Column({ type: "varchar", length: 40 })
  category!: string;

  @Column({ type: "varchar", length: 20 })
  outcome!: string;

  @Column({ name: "ip_address", type: "varchar", length: 100, nullable: true })
  ipAddress!: string | null;

  @Column({ type: "text", nullable: true })
  details!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
