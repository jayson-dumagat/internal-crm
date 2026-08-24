import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "contacts" })
@Index("idx_contacts_name", ["name"])
@Index("idx_contacts_email", ["email"])
@Index("idx_contacts_company_id", ["companyId"])
@Index("uq_contacts_source_lead_id", ["sourceLeadId"], {
  unique: true,
  where: '"source_lead_id" IS NOT NULL',
})
export class Contact {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "varchar", length: 150, nullable: true })
  tenantId!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  role!: string | null;

  @Column({ name: "company_id", type: "uuid", nullable: true })
  companyId!: string | null;

  @Column({ name: "company_name", type: "varchar", length: 255, nullable: true })
  companyName!: string | null;

  @Column({ type: "varchar", length: 320 })
  email!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ name: "relationship_level", type: "varchar", length: 20, default: "Medium" })
  relationshipLevel!: string;

  @Column({ name: "relationship_owner", type: "varchar", length: 255, nullable: true })
  relationshipOwner!: string | null;

  @Column({ name: "relationship_owner_id", type: "varchar", length: 150, nullable: true })
  relationshipOwnerId!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  location!: string | null;

  @Column({ name: "type_of_client", type: "varchar", length: 80, nullable: true })
  typeOfClient!: string | null;

  @Column({ name: "risk_profile", type: "varchar", length: 30, nullable: true })
  riskProfile!: string | null;

  @Column({ name: "preferred_contact_method", type: "varchar", length: 30, nullable: true })
  preferredContactMethod!: string | null;

  @Column({ type: "varchar", length: 30, default: "Prospect" })
  status!: string;

  @Column({ type: "text", array: true, default: "{}" })
  tags!: string[];

  @Column({ name: "avatar_url", type: "text", nullable: true })
  avatarUrl!: string | null;

  @Column({ name: "avatar_content_type", type: "varchar", length: 100, nullable: true })
  avatarContentType!: string | null;

  @Column({ name: "last_activity_at", type: "timestamptz", nullable: true })
  lastActivityAt!: Date | null;

  @Column({ name: "created_by_id", type: "varchar", length: 150, nullable: true })
  createdById!: string | null;

  /** The lead that originated this client record, when converted. */
  @Column({ name: "source_lead_id", type: "uuid", nullable: true })
  sourceLeadId!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
