import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import type {
  DataScope,
  FieldRule,
  ResourceAssignments,
} from "./access-control.js";

@Entity({ name: "user_access_policies" })
@Index("uq_user_access_policies_identity", ["entraTenantId", "entraObjectId"], {
  unique: true,
})
export class UserAccessPolicy {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "entra_tenant_id", type: "uuid" })
  entraTenantId!: string;

  @Column({ name: "entra_object_id", type: "uuid" })
  entraObjectId!: string;

  @Column({
    name: "allowed_permissions",
    type: "text",
    array: true,
    default: "{}",
  })
  allowedPermissions!: string[];

  @Column({
    name: "denied_permissions",
    type: "text",
    array: true,
    default: "{}",
  })
  deniedPermissions!: string[];

  @Column({ name: "field_rules", type: "jsonb", default: () => "'{}'::jsonb" })
  fieldRules!: Record<string, FieldRule>;

  @Column({ name: "data_scopes", type: "jsonb", default: () => "'{}'::jsonb" })
  dataScopes!: Record<string, DataScope>;

  @Column({
    name: "resource_assignments",
    type: "jsonb",
    default: () => "'{}'::jsonb",
  })
  resourceAssignments!: ResourceAssignments;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
