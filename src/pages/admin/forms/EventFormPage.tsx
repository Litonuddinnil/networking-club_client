import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Calendar } from "lucide-react";
import { useAxiosSecure } from "@/hooks/useAxiosSecure";
import FullPageForm from "@/components/admin/FullPageForm";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/components/admin/Field";
import ImageDropzone from "@/components/admin/ImageDropzone";
import { extractApiError } from "@/lib/extractApiError";

interface EventFormPageProps {
  onSuccess?: () => void;
}

const swalTheme = {
  background: "#03070E",
  color: "#fff",
  confirmButtonColor: "#10b981",
} as const;

function toastSuccess(title: string) {
  Swal.fire({
    title,
    icon: "success",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    background: "#03070E",
    color: "#fff",
  });
}

function swalError(text: string) {
  Swal.fire({ title: "Error!", text, icon: "error", ...swalTheme });
}

const EMPTY_FORM = {
  title: "",
  type: "Workshop",
  eventDateTime: "",
  location: "CSE Lab 1, JSTU Campus",
  description: "",
  image: "",
};

function parseDateTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // Convert to local datetime-local input format YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventFormPage({ onSuccess }: EventFormPageProps) {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [originalTitle, setOriginalTitle] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosSecure.get(`/api/events/${id}`);
        const record = res.data?.event || res.data?.data || res.data || null;
        if (cancelled) return;
        if (!record) {
          swalError("Event not found.");
          navigate("/dashboard/events", { replace: true });
          return;
        }
        setForm({
          title: record.title ?? "",
          type: record.type ?? "Workshop",
          // Combine date+time strings if present, else parse a Date
          eventDateTime:
            parseDateTime(record.date && record.time ? `${record.date} ${record.time}` : record.eventDateTime) ||
            "",
          location: record.location ?? "",
          description: record.description ?? "",
          image: record.image ?? "",
        });
        setOriginalTitle(record.title ?? "");
      } catch (err: any) {
        swalError(extractApiError(err, "Failed to load event."));
        navigate("/dashboard/events", { replace: true });
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, axiosSecure, navigate]);

  const isValid = useMemo(
    () => form.title.trim().length > 0 && form.eventDateTime.length > 0,
    [form.title, form.eventDateTime]
  );

  const handleSubmit = async () => {
    if (!isValid) {
      swalError("Please fill in title and date/time.");
      return;
    }
    setLoading(true);
    try {
      const dt = new Date(form.eventDateTime);
      const formattedDate = dt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const formattedTime = dt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const payload = {
        title: form.title,
        type: form.type || "Workshop",
        date: formattedDate,
        time: formattedTime,
        location: form.location,
        image:
          form.image ||
          "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80",
        description: form.description || "",
      };
      if (isEdit) {
        await axiosSecure.patch(`/api/events/${id}`, payload);
        toastSuccess("Event updated");
      } else {
        await axiosSecure.post("/api/events", payload);
        toastSuccess("Event published");
      }
      onSuccess?.();
      navigate("/dashboard/events", { replace: true });
    } catch (err: any) {
      swalError(extractApiError(err, "Failed to save event."));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-400 text-sm">
        Loading event…
      </div>
    );
  }

  return (
    <FullPageForm
      eyebrow={isEdit ? `Events · Edit · "${originalTitle || "Event"}"` : "Events · New"}
      title={isEdit ? "Edit event" : "Create new event"}
      description="Schedule a workshop, seminar, or meetup for club members."
      icon={<Calendar className="w-5 h-5" />}
      submitLabel={isEdit ? "Save changes" : "Publish event"}
      loading={loading}
      disableSubmit={!isValid}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Event title"
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="e.g. MikroTik RouterOS Lab"
        labelExtra={
          <span className="font-mono text-[10px] text-muted-foreground">
            {form.title.length}/120
          </span>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Event type"
          value={form.type}
          onValueChange={(v) => setForm({ ...form, type: v })}
          options={[
            { value: "Workshop", label: "Workshop" },
            { value: "Seminar", label: "Seminar" },
            { value: "Hackathon", label: "Hackathon" },
            { value: "Meetup", label: "Meetup" },
            { value: "Competition", label: "Competition" },
          ]}
        />
        <TextField
          label="Date & time"
          required
          type="datetime-local"
          value={form.eventDateTime}
          onChange={(e) => setForm({ ...form, eventDateTime: e.target.value })}
        />
      </div>

      <TextField
        label="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        placeholder="e.g. CSE Lab 1, JSTU Campus"
      />

      <TextAreaField
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="What attendees will learn..."
        rows={8}
        hint="Shown on the event card and the registration modal."
      />

      <ImageDropzone
        label="Cover image (optional)"
        value={form.image}
        onChange={(url) => setForm({ ...form, image: url })}
      />
    </FullPageForm>
  );
}
