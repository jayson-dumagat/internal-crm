import { Navigate, useLocation } from "react-router";

export default function AccessDenied() {
  const location = useLocation();

  return (
    <Navigate
      to="/unauthorized"
      replace
      state={{ from: `${location.pathname}${location.search}` }}
    />
  );
}
