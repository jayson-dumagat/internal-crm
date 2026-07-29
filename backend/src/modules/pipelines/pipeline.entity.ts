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
import { User } from "../users/user.entity";

import { PipelineStage } from "./pipeline.types";

@Entity({ name: "pipelines" })
@Index("uq_pipelines_name", ["name"], {
  unique: true,
})
@Index("idx_pipelines_created_by_id", ["createdById"])
@Index("idx_pipelines_is_active", ["isActive"])
export class Pipeline {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 150,
  })
  name!: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: "jsonb",
    default: () => "'[]'::jsonb",
  })
  stages!: PipelineStage[];

  @Column({
    name: "is_default",
    type: "boolean",
    default: false,
  })
  isDefault!: boolean;

  @Column({
    name: "is_active",
    type: "boolean",
    default: true,
  })
  isActive!: boolean;

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

  @OneToMany(() => Lead, (lead) => lead.pipeline)
  leads!: Lead[];

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