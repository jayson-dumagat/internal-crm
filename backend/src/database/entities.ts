import { Lead } from "../modules/leads/lead.entity.js";
import { Company } from "../modules/companies/company.entity.js";
import { Contact } from "../modules/contacts/contact.entity.js";
import { Organization } from "../modules/organizations/organization.entity.js";
import { Pipeline } from "../modules/pipelines/pipeline.entity.js";
import { Task } from "../modules/tasks/task.entity.js";
import { User } from "../modules/users/user.entity.js";
import { Activity } from "../modules/activities/activity.entity.js";
import { Note } from "../modules/notes/note.entity.js";
import { UserAccessPolicy } from "../modules/access/user-access-policy.entity.js";
import { Permission } from "../modules/access/permission.entity.js";
import { Role } from "../modules/access/role.entity.js";

export const entities = [
  User,
  Organization,
  Pipeline,
  Lead,
  Task,
  Company,
  Contact,
  Activity,
  Note,
  UserAccessPolicy,
  Permission,
  Role,
];
