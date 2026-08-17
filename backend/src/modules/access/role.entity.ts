import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Permission } from "./permission.entity";

@Entity({ name: "roles" })
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({
    type: "varchar",
    length: 100,
  })
  code!: string;

  @Column({
    type: "varchar",
    length: 150,
  })
  name!: string;

  @Index({ unique: true })
  @Column({
    name: "entra_app_role_value",
    type: "varchar",
    length: 150,
  })
  entraAppRoleValue!: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: "is_active",
    type: "boolean",
    default: true,
  })
  isActive!: boolean;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions!: Permission[];
}
