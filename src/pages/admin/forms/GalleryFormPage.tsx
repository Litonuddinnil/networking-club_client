import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { ImageIcon } from "lucide-react";
import { useAxiosSecure } from "@/hooks/useAxiosSecure";
import FullPageForm from "@/components/admin/FullPageForm";
import {
  TextField,
  SelectField,
} from "@/components/admin/Field";
import ImageDropzone from "@/components/admin/ImageDropzone";

interface GalleryFormPageProps {
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
  category: "Workshop",
  imageUrl: "",
};

export default function GalleryFormPage({ onSuccess }: GalleryFormPageProps) {
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
        const res = await axiosSecure.get(`/api/gallery/${id}`);
        const record = res.data?.item || res.data?.data || res.data || null;
        if (cancelled) return;
        if (!record) {
          swalError("Gallery item not found.");
          navigate("/dashboard/gallery", { replace: true });
          return;
        }
        setForm({
          title: record.title ?? "",
          category: record.category ?? "Workshop",
          imageUrl: record.imageUrl ?? record.image ?? "",
        });
        setOriginalTitle(record.title ?? "");
      } catch (err: any) {
        swalError(err?.message || "Failed to load gallery item.");
        navigate("/dashboard/gallery", { replace: true });
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, axiosSecure, navigate]);

  const isValid = useMemo(
    () => form.title.trim().length > 0 && form.imageUrl.trim().length > 0,
    [form.title, form.imageUrl]
  );

  const handleSubmit = async () => {
    if (!isValid) {
      swalError("Please add a title and image.");
      return;
    }
    setLoading(true);
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
      onSuccess?.();
      navigate("/dashboard/gallery", { replace: true });
    } catch (err: any) {
      swalError(err?.message || "Failed to save gallery item.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-400 text-sm">
        Loading gallery item…
      </div>
    );
  }

  return (
    <FullPageForm
      eyebrow={
        isEdit
          ? `Gallery · Edit · "${originalTitle || "Photo"}"`
          : "Gallery · New"
      }
      title={isEdit ? "Edit gallery item" : "Add to gallery"}
      description="Upload a photo from a workshop or event for the gallery wall."
      icon={<ImageIcon className="w-5 h-5" />}
      submitLabel={isEdit ? "Save changes" : "Upload media"}
      loading={loading}
      disableSubmit={!isValid}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Title"
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="e.g. IPv6 Seminar group photo"
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
    </FullPageForm>
  );
}
