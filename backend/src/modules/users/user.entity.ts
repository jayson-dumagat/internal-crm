import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Lead } from "../leads/lead.entity.js";

import { UserStatus } from "./user.types.js";

@Entity({ name: "users" })
@Index(
  "uq_users_entra_identity",
  ["entraTenantId", "entraObjectId"],
  {
    unique: true,
  },
)
@Index("idx_users_email", ["email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "entra_tenant_id",
    type: "uuid",
  })
  entraTenantId!: string;

  @Column({
    name: "entra_object_id",
    type: "uuid",
  })
  entraObjectId!: string;

  @Column({
    type: "varchar",
    length: 320,
    nullable: true,
  })
  email!: string | null;

  @Column({
    name: "display_name",
    type: "varchar",
    length: 255,
  })
  displayName!: string;

  @Column({
    name: "given_name",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  givenName!: string | null;

  @Column({
    name: "family_name",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  familyName!: string | null;

  @Column({
    name: "job_title",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  jobTitle!: string | null;

  @Column({
    type: "varchar",
    length: 150,
    nullable: true,
  })
  department!: string | null;

  @Column({
    name: "office_location",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  officeLocation!: string | null;

  @Column({
    name: "avatar_url",
    type: "text",
    nullable: true,
  })
  avatarUrl!: string | null;

  @Column({
    name: "avatar_content_type",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  avatarContentType!: string | null;

  @Column({
    type: "enum",
    enum: UserStatus,
    enumName: "user_status_enum",
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({
    name: "is_access_enabled",
    type: "boolean",
    default: true,
  })
  isAccessEnabled!: boolean;

  @Column({
    name: "last_login_at",
    type: "timestamptz",
    nullable: true,
  })
  lastLoginAt!: Date | null;

  @Column({
    name: "last_synced_at",
    type: "timestamptz",
    nullable: true,
  })
  lastSyncedAt!: Date | null;

  @OneToMany(() => Lead, (lead) => lead.owner)
  ownedLeads!: Lead[];

  @OneToMany(() => Lead, (lead) => lead.assignedTo)
  assignedLeads!: Lead[];

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
