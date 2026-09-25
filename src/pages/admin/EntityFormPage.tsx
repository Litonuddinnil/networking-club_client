import React, { useRef } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import EntityFormModals, {
  EditorKind,
} from "@/components/admin/EntityFormModals";
import { ENTITY_ROUTES, kindFromRouteSegment } from "@/lib/entityRoutes";

/**
 * Routed create/edit form.
 *
 *   /dashboard/:entity/new       → create
 *   /dashboard/:entity/:id/edit  → edit
 *
 * The form components already fetch their own record by id, so this page
 * only has to hand them `{ _id }` and decide where "cancel" and "saved"
 * navigate back to.
 */
export default function EntityFormPage() {
  const { entity, id } = useParams<{ entity: string; id?: string }>();
  const navigate = useNavigate();

  // The form components call onSaved() and then onClose() back to back.
  // Without this guard that would push a second history entry on top of
  // the redirect, so Back would land on the page you just left.
  const savedRef = useRef(false);

  const kind = kindFromRouteSegment(entity);
  if (!kind) return <Navigate to="/dashboard" replace />;

  const listPath = `/dashboard?tab=${ENTITY_ROUTES[kind].tab}`;
  const doneTo = id ? `/dashboard/${entity}/${id}` : listPath;

  return (
    <EntityFormModals
      surface="page"
      editor={{
        open: true,
        kind: kind as EditorKind,
        record: id ? { _id: id } : null,
      }}
      onSaved={() => {
        // On success go to the record's detail page (edit) or back to the
        // list (create), replacing the form so Back skips it.
        savedRef.current = true;
        navigate(doneTo, { replace: true });
      }}
      onClose={() => {
        if (savedRef.current) return;
        navigate(doneTo);
      }}
    />
  );
}
