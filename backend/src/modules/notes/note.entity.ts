import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "notes" })
@Index("idx_notes_tenant_updated_at", ["tenantId", "updatedAt"])
@Index("idx_notes_category", ["category"])
export class Note {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ name: "content_html", type: "text", nullable: true })
  contentHtml!: string | null;

  @Column({ type: "varchar", length: 40 })
  category!: string;

  @Column({ name: "related_to", type: "varchar", length: 255, nullable: true })
  relatedTo!: string | null;

  @Column({ name: "author_id", type: "uuid", nullable: true })
  authorId!: string | null;

  @Column({ name: "author_name", type: "varchar", length: 255 })
  authorName!: string;

  @Column({ name: "author_avatar_url", type: "text", nullable: true })
  authorAvatarUrl!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
