/**
 * Mapping between admin entity kinds, their REST endpoints, their
 * dashboard tab and their URL segment.
 *
 * The view and create/edit flows used to be modals; they are now real
 * routes (/dashboard/posts/:id, /dashboard/posts/:id/edit,
 * /dashboard/posts/new) so a record can be linked, bookmarked, shared
 * and reopened with the browser's back button.
 */

export type EntityKind =
  | "post"
  | "event"
  | "announcement"
  | "gallery"
  | "member";

interface EntityRoute {
  /** URL segment: /dashboard/<segment>/... */
  segment: string;
  /** REST collection: /api/<endpoint> */
  endpoint: string;
  /** Dashboard tab to return to. */
  tab: string;
  /** Singular label used in page copy. */
  label: string;
  /** Whether this kind has a create/edit form. */
  editable: boolean;
}

export const ENTITY_ROUTES: Record<EntityKind, EntityRoute> = {
  post: {
    segment: "posts",
    endpoint: "posts",
    tab: "posts",
    label: "Post",
    editable: true,
  },
  event: {
    segment: "events",
    endpoint: "events",
    tab: "events",
    label: "Event",
    editable: true,
  },
  announcement: {
    segment: "announcements",
    endpoint: "announcements",
    tab: "announcements",
    label: "Announcement",
    editable: true,
  },
  gallery: {
    segment: "gallery",
    endpoint: "gallery",
    tab: "gallery",
    label: "Gallery item",
    editable: true,
  },
  member: {
    segment: "members",
    endpoint: "members",
    tab: "members",
    label: "Member",
    editable: false,
  },
};

const BY_SEGMENT: Record<string, EntityKind> = Object.entries(
  ENTITY_ROUTES
).reduce((acc, [kind, cfg]) => {
  acc[cfg.segment] = kind as EntityKind;
  return acc;
}, {} as Record<string, EntityKind>);

/** Resolve a URL segment ("posts") back to its kind ("post"). */
export function kindFromRouteSegment(
  segment: string | undefined
): EntityKind | null {
  if (!segment) return null;
  return BY_SEGMENT[segment] ?? null;
}

/** Path of a record's detail page. */
export function detailPath(kind: EntityKind, id: string): string {
  return `/dashboard/${ENTITY_ROUTES[kind].segment}/${id}`;
}

/** Path of a record's edit form. */
export function editPath(kind: EntityKind, id: string): string {
  return `/dashboard/${ENTITY_ROUTES[kind].segment}/${id}/edit`;
}

/** Path of the create form for a kind. */
export function createPath(kind: EntityKind): string {
  return `/dashboard/${ENTITY_ROUTES[kind].segment}/new`;
}

/** Path of the list (tab) a kind belongs to. */
export function listPath(kind: EntityKind): string {
  return `/dashboard?tab=${ENTITY_ROUTES[kind].tab}`;
}

/** Pull the id off a record regardless of which shape the API returned. */
export function recordId(record: any): string | null {
  return record?._id || record?.id || record?.memberId || null;
}
