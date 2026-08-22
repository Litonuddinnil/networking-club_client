import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { BookOpen } from "lucide-react";
import { useAxiosSecure } from "@/hooks/useAxiosSecure";
import FullPageForm from "@/components/admin/FullPageForm";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/components/admin/Field";
import ImageDropzone from "@/components/admin/ImageDropzone";
import { extractApiError } from "@/lib/extractApiError";

interface PostFormPageProps {
  /** When provided, the admin props.page receives injected state on submit-success */
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
  category: "General",
  content: "",
  coverImage: "",
};

export default function PostFormPage({ onSuccess }: PostFormPageProps) {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [originalTitle, setOriginalTitle] = useState("");

  // Load record when in edit mode
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosSecure.get(`/api/posts/${id}`);
        const record = res.data?.post || res.data?.data || res.data || null;
        if (cancelled || !record) {
          if (!record) swalError("Post not found.");
          return;
        }
        setForm({
          title: record.title ?? "",
          category: record.category ?? "General",
          content: record.content ?? "",
          coverImage: record.coverImage ?? record.image ?? "",
        });
        setOriginalTitle(record.title ?? "");
      } catch (err: any) {
        swalError(extractApiError(err, "Failed to load post."));
        navigate("/dashboard/posts", { replace: true });
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
      onSuccess?.();
      navigate("/dashboard/posts", { replace: true });
    } catch (err: any) {
      swalError(extractApiError(err, "Failed to save post."));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-400 text-sm">
        Loading post…
      </div>
    );
  }

  return (
    <FullPageForm
      eyebrow={isEdit ? `Posts · Edit · "${originalTitle || "Post"}"` : "Posts · New"}
      title={isEdit ? "Edit article" : "Create new article"}
      description="Publish a story, tutorial, or club update for the membership feed."
      icon={<BookOpen className="w-5 h-5" />}
      submitLabel={isEdit ? "Save changes" : "Publish article"}
      loading={loading}
      disableSubmit={!isValid}
      onSubmit={handleSubmit}
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
        rows={12}
        hint="Markdown supported: # headings, **bold**, - lists, [links](url)"
      />
      <ImageDropzone
        label="Cover image (optional)"
        value={form.coverImage}
        onChange={(url) => setForm({ ...form, coverImage: url })}
      />
    </FullPageForm>
  );
}
