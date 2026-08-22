import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Megaphone } from "lucide-react";
import { useAxiosSecure } from "@/hooks/useAxiosSecure";
import FullPageForm from "@/components/admin/FullPageForm";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/components/admin/Field";
import ImageDropzone from "@/components/admin/ImageDropzone";

interface AnnouncementFormPageProps {
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
  category: "Notice",
  content: "",
  coverImage: "",
};

export default function AnnouncementFormPage({ onSuccess }: AnnouncementFormPageProps) {
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
        const res = await axiosSecure.get(`/api/announcements/${id}`);
        const record = res.data?.announcement || res.data?.data || res.data || null;
        if (cancelled) return;
        if (!record) {
          swalError("Announcement not found.");
          navigate("/dashboard/announcements", { replace: true });
          return;
        }
        setForm({
          title: record.title ?? "",
          category: record.category ?? "Notice",
          content: record.content ?? "",
          coverImage: record.coverImage ?? record.image ?? "",
        });
        setOriginalTitle(record.title ?? "");
      } catch (err: any) {
        swalError(err?.message || "Failed to load announcement.");
        navigate("/dashboard/announcements", { replace: true });
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, axiosSecure, navigate]);

  const isValid = useMemo(
    () => form.title.trim().length > 0 && form.content.trim().length > 0,
    [form.title, form.content]
  );

  const handleSubmit = async () => {
    if (!isValid) {
      swalError("Please fill in title and content.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        category: form.category || "Notice",
        content: form.content,
        coverImage: form.coverImage || "",
        date: new Date().toLocaleDateString(),
      };
      if (isEdit) {
        await axiosSecure.patch(`/api/announcements/${id}`, payload);
        toastSuccess("Announcement updated");
      } else {
        await axiosSecure.post("/api/announcements", payload);
        toastSuccess("Announcement broadcast");
      }
      onSuccess?.();
      navigate("/dashboard/announcements", { replace: true });
    } catch (err: any) {
      swalError(err?.message || "Failed to save announcement.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-400 text-sm">
        Loading announcement…
      </div>
    );
  }

  return (
    <FullPageForm
      eyebrow={
        isEdit
          ? `Announcements · Edit · "${originalTitle || "Announcement"}"`
          : "Announcements · New"
      }
      title={isEdit ? "Edit announcement" : "Post announcement"}
      description="Broadcast an urgent notice to all club members."
      icon={<Megaphone className="w-5 h-5" />}
      submitLabel={isEdit ? "Save changes" : "Broadcast"}
      loading={loading}
      disableSubmit={!isValid}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Announcement title"
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="e.g. Lab booking opens tomorrow"
      />
      <SelectField
        label="Category"
        value={form.category}
        onValueChange={(v) => setForm({ ...form, category: v })}
        options={[
          { value: "Notice", label: "Notice" },
          { value: "Urgent", label: "Urgent" },
          { value: "Event", label: "Event" },
          { value: "Maintenance", label: "Maintenance" },
          { value: "General", label: "General" },
        ]}
      />
      <TextAreaField
        label="Content"
        required
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        placeholder="Write the announcement..."
        rows={10}
      />
      <ImageDropzone
        label="Cover image (optional)"
        value={form.coverImage}
        onChange={(url) => setForm({ ...form, coverImage: url })}
      />
    </FullPageForm>
  );
}
