import { Lead } from "../modules/leads/lead.entity.js";
import { Organization } from "../modules/organizations/organization.entity.js";
import { Pipeline } from "../modules/pipelines/pipeline.entity.js";
import { Task } from "../modules/tasks/task.entity.js";
import { User } from "../modules/users/user.entity.js";

export const entities = [
  User,
  Organization,
  Pipeline,
  Lead,
  Task,
];