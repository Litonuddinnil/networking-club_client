import React, { useEffect, useMemo, useState } from "react";
import { swalError, swalToast } from "@/lib/swal";
import { BookOpen, Megaphone, ImageIcon, CalendarDays } from "lucide-react";

import EntityFormDialog from "@/components/admin/EntityFormDialog";
import EntityFormSurface from "@/components/admin/EntityFormSurface";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/components/admin/Field";
import ImageDropzone from "@/components/admin/ImageDropzone";
import { useAxiosSecure } from "@/hooks/useAxiosSecure";
import { extractApiError } from "@/lib/extractApiError";

/**
 * Modal-driven create/edit forms for Posts, Events, Announcements, and
 * Gallery items. Replaces the previous full-page route flow.
 *
 * The parent (AdminDashboard) keeps a single piece of state:
 *
 *   editor: { open, kind, record } | null
 *
 * and renders `<EntityFormModals editor={...} onClose={...} onSaved={...} />`
 * once at the bottom of the dashboard tree.
 */

export type EditorKind = "post" | "event" | "announcement" | "gallery";

export interface EditorState {
  open: boolean;
  kind: EditorKind | null;
  /** When set, the form is in edit mode for that record. */
  record: any | null;
}

/**
 * Where the form renders. "dialog" is the modal used inside the admin
 * dashboard; "page" is the routed full-page surface at
 * /dashboard/:entity/new and /dashboard/:entity/:id/edit.
 * Both shells take identical props, so the form bodies are shared.
 */
export type FormSurface = "dialog" | "page";

interface EntityFormModalsProps {
  editor: EditorState;
  onClose: () => void;
  /** Called after a successful save — parent refreshes data. */
  onSaved: () => void;
  surface?: FormSurface;
}

const toastSuccess = swalToast;

/* ──────────────────────────────────────────────────────────────────────────
   Shared form-state model
   ────────────────────────────────────────────────────────────────────── */

const POST_EMPTY = {
  title: "",
  category: "General",
  content: "",
  coverImage: "",
};

const EVENT_EMPTY = {
  title: "",
  type: "Workshop",
  status: "upcoming",
  category: "Workshop",
  eventDate: "",
  time: "",
  location: "",
  description: "",
  capacity: "",
  coverImage: "",
};

const ANNOUNCEMENT_EMPTY = {
  title: "",
  category: "General",
  content: "",
  coverImage: "",
};

const GALLERY_EMPTY = {
  title: "",
  category: "Workshop",
  imageUrl: "",
};

export default function EntityFormModals({
  editor,
  onClose,
  onSaved,
  surface = "dialog",
}: EntityFormModalsProps) {
  if (!editor.open || !editor.kind) return null;
  if (editor.kind === "post") {
    return (
      <PostFormModal
        open={editor.open}
        record={editor.record}
        onClose={onClose}
        onSaved={onSaved}
        surface={surface}
      />
    );
  }
  if (editor.kind === "event") {
    return (
      <EventFormModal
        open={editor.open}
        record={editor.record}
        onClose={onClose}
        onSaved={onSaved}
        surface={surface}
      />
    );
  }
  if (editor.kind === "announcement") {
    return (
      <AnnouncementFormModal
        open={editor.open}
        record={editor.record}
        onClose={onClose}
        onSaved={onSaved}
        surface={surface}
      />
    );
  }
  return (
    <GalleryFormModal
      open={editor.open}
      record={editor.record}
      onClose={onClose}
      onSaved={onSaved}
      surface={surface}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Hook — shared submit lifecycle (id, isEdit, fetch, save)
   ────────────────────────────────────────────────────────────────────── */
function useRecordForm({
  open,
  record,
  endpoint,
}: {
  open: boolean;
  record: any | null;
  endpoint: string; // e.g. "posts", "events"
}) {
  const id = record?._id || record?.id || null;
  const isEdit = Boolean(id);
  const axiosSecure = useAxiosSecure();
  const [fetching, setFetching] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Reset saving state every time the modal re-opens, otherwise an
  // old `saving: true` from a prior save would persist.
  useEffect(() => {
    if (open) setSaving(false);
  }, [open, id]);

  const fetchRecord = async () => {
    if (!id) return null;
    try {
      const res = await axiosSecure.get(`/api/${endpoint}/${id}`);
      const payload = res.data?.data || res.data?.post || res.data?.event || res.data?.announcement || res.data?.item || res.data || null;
      return payload || null;
    } catch (err: any) {
      swalError(extractApiError(err, `Failed to load ${endpoint.slice(0, -1)}.}`));
      throw err;
    }
  };

  return {
    id,
    isEdit,
    axiosSecure,
    fetching,
    setFetching,
    saving,
    setSaving,
    fetchRecord,
    endpoint,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
   Post form modal
   ────────────────────────────────────────────────────────────────────── */
function PostFormModal({
  open,
  record,
  onClose,
  onSaved,
  surface = "dialog",
}: {
  open: boolean;
  record: any | null;
  onClose: () => void;
  onSaved: () => void;
  surface?: FormSurface;
}) {
  const Shell = surface === "page" ? EntityFormSurface : EntityFormDialog;
  const { id, isEdit, axiosSecure, fetching, setFetching, saving, setSaving } =
    useRecordForm({ open, record, endpoint: "posts" });
  const [form, setForm] = useState(POST_EMPTY);

  useEffect(() => {
    let cancelled = false;
    if (!open) return;
    setForm(POST_EMPTY);
    if (!id) {
      setFetching(false);
      return;
    }
    (async () => {
      try {
        const res = await axiosSecure.get(`/api/posts/${id}`);
        if (cancelled) return;
        const r = res.data?.post || res.data?.data || res.data || null;
        if (r) {
          setForm({
            title: r.title ?? "",
            category: r.category ?? "General",
            content: r.content ?? "",
            coverImage: r.coverImage ?? r.image ?? "",
          });
        } else {
          swalError("Post not found.");
        }
      } catch (err: any) {
        if (!cancelled)
          swalError(extractApiError(err, "Failed to load post."));
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open]);

  const isValid =
    form.title.trim().length > 0 && form.content.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) {
      swalError("Please fill in title and content.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category || "General",
        content: form.content,
        coverImage: form.coverImage || "",
        date: new Date().toLocaleDateString(),
      };
      if (isEdit) {
        await axiosSecure.patch(`/api/posts/${id}`, payload);
        toastSuccess("Post updated");
      } else {
        await axiosSecure.post("/api/posts", payload);
        toastSuccess("Post published");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      swalError(extractApiError(err, "Failed to save post."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      mode={isEdit ? "edit" : "create"}
      title={isEdit ? "Edit article" : "Create new article"}
      description="Publish a story, tutorial, or club update for the membership feed."
      icon={<BookOpen className="w-5 h-5" />}
      size="lg"
      loading={saving || fetching}
      loadingText={fetching ? "Loading post…" : "Saving post…"}
      submitLabel={isEdit ? "Save changes" : "Publish article"}
      onSubmit={handleSubmit}
      preventOutsideClose={saving}
    >
      <TextField
        label="Post title"
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="e.g. Getting started with OSPF"
        labelExtra={
          <span className="font-mono text-[10px] text-muted-foreground">
            {form.title.length}/140
          </span>
        }
        hint="Keep it punchy for the feed."
      />
      <SelectField
        label="Category"
        value={form.category}
        onValueChange={(v) => setForm({ ...form, category: v })}
        options={[
          { value: "General", label: "General" },
          { value: "Networking", label: "Networking" },
          { value: "Security", label: "Security" },
          { value: "Workshop", label: "Workshop" },
          { value: "Career", label: "Career" },
        ]}
      />
      <TextAreaField
        label="Content"
        required
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        placeholder="Write your post body (Markdown supported)..."
        rows={10}
        hint="Markdown supported: # headings, **bold**, - lists, [links](url)"
      />
      <ImageDropzone
        label="Cover image (optional)"
        value={form.coverImage}
        onChange={(url) => setForm({ ...form, coverImage: url })}
      />
    </Shell>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Event form modal
   ────────────────────────────────────────────────────────────────────── */
function EventFormModal({
  open,
  record,
  onClose,
  onSaved,
  surface = "dialog",
}: {
  open: boolean;
  record: any | null;
  onClose: () => void;
  onSaved: () => void;
  surface?: FormSurface;
}) {
  const Shell = surface === "page" ? EntityFormSurface : EntityFormDialog;
  const { id, isEdit, axiosSecure, fetching, setFetching, saving, setSaving } =
    useRecordForm({ open, record, endpoint: "events" });
  const [form, setForm] = useState(EVENT_EMPTY);

  useEffect(() => {
    let cancelled = false;
    if (!open) return;
    setForm(EVENT_EMPTY);
    if (!id) {
      setFetching(false);
      return;
    }
    (async () => {
      try {
        const res = await axiosSecure.get(`/api/events/${id}`);
        if (cancelled) return;
        const r = res.data?.event || res.data?.data || res.data || null;
        if (r) {
          // Try to normalise date+time to local datetime-local string
          const eventDateRaw = r.eventDate || r.date || "";
          const timeRaw = r.time || "";
          let eventDateLocal = "";
          if (eventDateRaw) {
            const d = new Date(eventDateRaw);
            if (!Number.isNaN(d.getTime())) {
              const pad = (n: number) => String(n).padStart(2, "0");
              eventDateLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }
          }
          setForm({
            title: r.title ?? "",
            type: r.type ?? r.category ?? "Workshop",
            status: (r.status ?? "upcoming").toLowerCase(),
            category: r.category ?? r.type ?? "Workshop",
            eventDate: eventDateLocal || (timeRaw ? `${new Date().toISOString().slice(0, 10)}T${timeRaw}` : ""),
            time: timeRaw || "",
            location: r.location ?? r.venue ?? "",
            description: r.description ?? "",
            capacity: r.capacity != null ? String(r.capacity) : "",
            coverImage: r.coverImage ?? r.imageUrl ?? r.image ?? "",
          });
        } else {
          swalError("Event not found.");
        }
      } catch (err: any) {
        if (!cancelled)
          swalError(extractApiError(err, "Failed to load event."));
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open]);

  const isValid = useMemo(
    () => form.title.trim().length > 0 && form.eventDate.trim().length > 0,
    [form.title, form.eventDate]
  );

  const handleSubmit = async () => {
    if (!isValid) {
      swalError("Please add a title and date.");
      return;
    }
    setSaving(true);
    try {
      // `form.eventDate` is a datetime-local value ("2026-09-25T14:30").
      // Split it into the plain calendar day and clock time, and send all
      // three fields: the API validates `date`, the cards sort on
      // `eventDate`, and `time` is shown on its own in a few views.
      // Sending only `eventDate` used to fail validation with
      // "Event date is required" because the server never derived `date`
      // from it. Keeping `eventDate` as the raw local string (not an ISO
      // UTC string) means the day can't drift for UTC+X users.
      const [datePart, rawTime] = form.eventDate.split("T");
      const timePart = form.time || rawTime || "";
      const payload: any = {
        title: form.title.trim(),
        type: form.type || "Workshop",
        status: form.status || "upcoming",
        category: form.type || "Workshop",
        date: datePart,
        eventDate: timePart ? `${datePart}T${timePart}` : datePart,
        time: timePart,
        location: form.location,
        description: form.description,
        coverImage: form.coverImage || "",
      };
      if (form.capacity && Number(form.capacity) > 0) {
        payload.capacity = Number(form.capacity);
      }
      if (isEdit) {
        await axiosSecure.patch(`/api/events/${id}`, payload);
        toastSuccess("Event updated");
      } else {
        await axiosSecure.post("/api/events", payload);
        toastSuccess("Event created");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      swalError(extractApiError(err, "Failed to save event."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      mode={isEdit ? "edit" : "create"}
      title={isEdit ? "Edit event" : "Create event"}
      description="Schedule a workshop, seminar, or meetup for the club."
      icon={<CalendarDays className="w-5 h-5" />}
      size="xl"
      loading={saving || fetching}
      loadingText={fetching ? "Loading event…" : "Saving event…"}
      submitLabel={isEdit ? "Save changes" : "Create event"}
      onSubmit={handleSubmit}
      preventOutsideClose={saving}
    >
      <TextField
        label="Event title"
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="e.g. IPv6 Hands-on Lab"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectField
          label="Type"
          value={form.type}
          onValueChange={(v) => setForm({ ...form, type: v, category: v })}
          options={[
            { value: "Workshop", label: "Workshop" },
            { value: "Seminar", label: "Seminar" },
            { value: "Contest", label: "Contest" },
            { value: "E-Sports", label: "E-Sports" },
            { value: "Hackathon", label: "Hackathon" },
            { value: "Meetup", label: "Meetup" },
            { value: "Networking", label: "Networking" },
          ]}
        />
        <SelectField
          label="Status"
          value={form.status}
          onValueChange={(v) => setForm({ ...form, status: v })}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "ongoing", label: "Ongoing" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField
          label="Date & time"
          required
          type="datetime-local"
          value={form.eventDate}
          onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
        />
        <TextField
          label="Capacity"
          type="number"
          min={0}
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          placeholder="optional"
        />
      </div>
      <TextField
        label="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        placeholder="e.g. CSE Lab 3 or Online (Zoom)"
      />
      <TextAreaField
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Briefly describe the event…"
        rows={5}
      />
      <ImageDropzone
        label="Cover image (optional)"
        value={form.coverImage}
        onChange={(url) => setForm({ ...form, coverImage: url })}
      />
    </Shell>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Announcement form modal
   ────────────────────────────────────────────────────────────────────── */
function AnnouncementFormModal({
  open,
  record,
  onClose,
  onSaved,
  surface = "dialog",
}: {
  open: boolean;
  record: any | null;
  onClose: () => void;
  onSaved: () => void;
  surface?: FormSurface;
}) {
  const Shell = surface === "page" ? EntityFormSurface : EntityFormDialog;
  const { id, isEdit, axiosSecure, fetching, setFetching, saving, setSaving } =
    useRecordForm({ open, record, endpoint: "announcements" });
  const [form, setForm] = useState(ANNOUNCEMENT_EMPTY);

  useEffect(() => {
    let cancelled = false;
    if (!open) return;
    setForm(ANNOUNCEMENT_EMPTY);
    if (!id) {
      setFetching(false);
      return;
    }
    (async () => {
      try {
        const res = await axiosSecure.get(`/api/announcements/${id}`);
        if (cancelled) return;
        const r = res.data?.announcement || res.data?.data || res.data || null;
        if (r) {
          setForm({
            title: r.title ?? "",
            category: r.category ?? "General",
            content: r.content ?? "",
            coverImage: r.coverImage ?? r.image ?? "",
          });
        } else {
          swalError("Announcement not found.");
        }
      } catch (err: any) {
        if (!cancelled)
          swalError(extractApiError(err, "Failed to load announcement."));
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open]);

  const isValid =
    form.title.trim().length > 0 && form.content.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) {
      swalError("Please add a title and message.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category || "General",
        content: form.content,
        coverImage: form.coverImage || "",
        date: new Date().toLocaleDateString(),
      };
      if (isEdit) {
        await axiosSecure.patch(`/api/announcements/${id}`, payload);
        toastSuccess("Announcement updated");
      } else {
        await axiosSecure.post("/api/announcements", payload);
        toastSuccess("Announcement posted");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      swalError(extractApiError(err, "Failed to save announcement."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      mode={isEdit ? "edit" : "create"}
      title={isEdit ? "Edit announcement" : "New announcement"}
      description="Post a club notice, deadline, or service update."
      icon={<Megaphone className="w-5 h-5" />}
      size="lg"
      loading={saving || fetching}
      loadingText={fetching ? "Loading announcement…" : "Saving announcement…"}
      submitLabel={isEdit ? "Save changes" : "Post announcement"}
      onSubmit={handleSubmit}
      preventOutsideClose={saving}
    >
      <TextField
        label="Title"
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="e.g. Lab closed on Sunday"
        labelExtra={
          <span className="font-mono text-[10px] text-muted-foreground">
            {form.title.length}/100
          </span>
        }
      />
      <SelectField
        label="Category"
        value={form.category}
        onValueChange={(v) => setForm({ ...form, category: v })}
        options={[
          { value: "General", label: "General" },
          { value: "Urgent", label: "Urgent" },
          { value: "Event", label: "Event" },
          { value: "Maintenance", label: "Maintenance" },
          { value: "Deadline", label: "Deadline" },
        ]}
      />
      <TextAreaField
        label="Message"
        required
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        placeholder="Write the announcement body..."
        rows={8}
      />
      <ImageDropzone
        label="Attachment (optional)"
        value={form.coverImage}
        onChange={(url) => setForm({ ...form, coverImage: url })}
      />
    </Shell>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Gallery form modal
   ────────────────────────────────────────────────────────────────────── */
function GalleryFormModal({
  open,
  record,
  onClose,
  onSaved,
  surface = "dialog",
}: {
  open: boolean;
  record: any | null;
  onClose: () => void;
  onSaved: () => void;
  surface?: FormSurface;
}) {
  const Shell = surface === "page" ? EntityFormSurface : EntityFormDialog;
  const { id, isEdit, axiosSecure, fetching, setFetching, saving, setSaving } =
    useRecordForm({ open, record, endpoint: "gallery" });
  const [form, setForm] = useState(GALLERY_EMPTY);

  useEffect(() => {
    let cancelled = false;
    if (!open) return;
    setForm(GALLERY_EMPTY);
    if (!id) {
      setFetching(false);
      return;
    }
    (async () => {
      try {
        const res = await axiosSecure.get(`/api/gallery/${id}`);
        if (cancelled) return;
        const r = res.data?.item || res.data?.data || res.data || null;
        if (r) {
          setForm({
            title: r.title ?? "",
            category: r.category ?? "Workshop",
            imageUrl: r.imageUrl ?? r.image ?? r.coverImage ?? "",
          });
        } else {
          swalError("Gallery item not found.");
        }
      } catch (err: any) {
        if (!cancelled)
          swalError(extractApiError(err, "Failed to load gallery item."));
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open]);

  const isValid =
    form.title.trim().length > 0 && form.imageUrl.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) {
      swalError("Please add a title and image.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        category: form.category || "Workshop",
        imageUrl: form.imageUrl,
        date: new Date().toLocaleDateString(),
      };
      if (isEdit) {
        await axiosSecure.patch(`/api/gallery/${id}`, payload);
        toastSuccess("Gallery item updated");
      } else {
        await axiosSecure.post("/api/gallery", payload);
        toastSuccess("Media uploaded");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      swalError(extractApiError(err, "Failed to save gallery item."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      mode={isEdit ? "edit" : "create"}
      title={isEdit ? "Edit gallery item" : "Add to gallery"}
      description="Upload a photo from a workshop or event for the gallery wall."
      icon={<ImageIcon className="w-5 h-5" />}
      size="lg"
      loading={saving || fetching}
      loadingText={fetching ? "Loading gallery item…" : "Saving gallery item…"}
      submitLabel={isEdit ? "Save changes" : "Upload media"}
      onSubmit={handleSubmit}
      preventOutsideClose={saving}
    >
      <TextField
        label="Title"
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="e.g. IPv6 Seminar group photo"
        labelExtra={
          <span className="font-mono text-[10px] text-muted-foreground">
            {form.title.length}/80
          </span>
        }
      />
      <SelectField
        label="Category"
        value={form.category}
        onValueChange={(v) => setForm({ ...form, category: v })}
        options={[
          { value: "Workshop", label: "Workshop" },
          { value: "Seminar", label: "Seminar" },
          { value: "Hackathon", label: "Hackathon" },
          { value: "Meetup", label: "Meetup" },
          { value: "Award", label: "Award" },
        ]}
      />
      <ImageDropzone
        label="Image"
        required
        value={form.imageUrl}
        onChange={(url) => setForm({ ...form, imageUrl: url })}
      />
    </Shell>
  );
}
