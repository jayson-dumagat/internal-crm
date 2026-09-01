import { Navigate } from "react-router";

export default function Pipelines() {
  // Lead stages now live on the Leads page. Keep this route as a backwards
  // compatible link for bookmarks, without exposing the old custom view/stage
  // builder.
  return <Navigate to="/leads?view=kanban" replace />;
}
