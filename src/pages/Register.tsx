import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../provider/AuthProvider";
import {
  ShieldAlert,
  UserPlus,
  Lock,
  Mail,
  User,
  BookOpen,
  CreditCard,
  Camera,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { uploadImageToImgbb, ImageUploadError } from "../lib/uploadImage";

type RegisterFormInputs = {
  name: string;
  email: string;
  studentId: string;
  department: string;
  password: string;
};

export default function Register() {
  const { register: registerAuth, error } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Profile photo state — preview (local object URL) + uploaded URL (hosted)
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // Reset any previously-uploaded URL since the file changed
    setPhotoUrl(null);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(previewUrl);

    // Allow re-selecting the same file later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadPhoto = async () => {
    if (!photoFile || isUploadingPhoto) return;
    setIsUploadingPhoto(true);
    setLocalError(null);
    try {
      const url = await uploadImageToImgbb(photoFile);
      setPhotoUrl(url);
      await Swal.fire({
        icon: "success",
        title: "Photo uploaded",
        text: "Profile image is ready. Submit the form to complete registration.",
        background: "#03070E",
        color: "#ffffff",
        confirmButtonColor: "#22c55e",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err: any) {
      const msg =
        err instanceof ImageUploadError
          ? err.message
          : err?.message || "Could not upload image. Try again.";
      setLocalError(msg);
      Swal.fire({
        icon: "error",
        title: "Image upload failed",
        text: msg,
        background: "#03070E",
        color: "#ffffff",
        confirmButtonColor: "#22c55e",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    setLocalError(null);

    try {
      // Single source of truth: AuthProvider.register creates the Firebase
      // account AND inserts the MongoDB member document exactly once.
      // If a photo was staged but never uploaded, do it now so the registry
      // shard always carries the final hosted URL.
      let finalPhotoUrl = photoUrl;
      if (!finalPhotoUrl && photoFile) {
        finalPhotoUrl = await uploadImageToImgbb(photoFile);
        setPhotoUrl(finalPhotoUrl);
      }

      const created = await registerAuth(
        data.email,
        data.password,
        data.name,
        data.department,
        data.studentId,
        finalPhotoUrl || "",
      );

      const generatedMemberId =
        created?.memberId ?? "JNC-pending";

      // Success Alert
      await Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: `Your Member ID is ${generatedMemberId}. Waiting for admin approval.`,
        background: "#03070E",
        color: "#ffffff",
        confirmButtonColor: "#22c55e",
      });

      navigate("/dashboard");
    } catch (err: any) {
      setLocalError(
        err.message ||
          "Registry conflict: This email might already be assigned to a node."
      );

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.message || "Something went wrong!",
        background: "#03070E",
        color: "#ffffff",
        confirmButtonColor: "#22c55e",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#03070E]/90 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent pointer-events-none" />

      <div className="space-y-1.5 text-center">
        <h2 className="text-xl font-display font-extrabold text-white tracking-wide">Register Node Registry</h2>
        <p className="text-xs text-slate-500">Become a certified JSTU Networking Club auditor</p>
      </div>

      {(error || localError) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start space-x-2.5 text-red-400 text-[11px] font-mono leading-normal">
          <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
          <span>{localError || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Profile Photo Cover Upload (optional — imgbb) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Profile Cover Photo <span className="text-slate-600">(optional)</span>
            </label>
            {photoPreview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-[9px] font-mono text-rose-400 hover:text-rose-300 uppercase tracking-wider inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            id="profile-photo-input"
          />

          <label
            htmlFor="profile-photo-input"
            className="group relative block w-full aspect-[16/9] sm:aspect-[5/2] rounded-2xl overflow-hidden border border-dashed border-white/15 hover:border-emerald-500/50 bg-gradient-to-br from-[#03070E] via-[#04091a] to-[#03070E] cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10"
          >
            {photoPreview ? (
              <>
                <img
                  src={photoPreview}
                  alt="Profile cover preview"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03070E] via-[#03070E]/30 to-transparent" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 grid grid-cols-12 gap-px opacity-20 pointer-events-none">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="bg-white/[0.04]" />
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 grid place-items-center group-hover:bg-emerald-500/20 transition-colors">
                    <ImagePlus className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Drop or click to upload cover
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    JPG · PNG · WebP · max 5 MB
                  </p>
                </div>
              </>
            )}

            {/* top-left status pill */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest bg-slate-900/70 border border-white/10 text-slate-300 backdrop-blur-md">
                <Camera className="w-3 h-3" />
                Cover
              </span>
              {photoUrl && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 backdrop-blur-md">
                  ✓ Uploaded
                </span>
              )}
            </div>

            {/* bottom-right meta + change affordance */}
            <div className="absolute bottom-3 right-3 max-w-[60%] flex items-center gap-2">
              {photoFile && (
                <span className="px-2 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-[9px] font-mono text-slate-300 truncate backdrop-blur-md">
                  {photoFile.name} · {(photoFile.size / 1024).toFixed(0)} KB
                </span>
              )}
              <span className="inline-grid place-items-center w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-colors">
                <ImagePlus className="w-4 h-4" />
              </span>
            </div>
          </label>

          {photoFile && !photoUrl && (
            <button
              type="button"
              onClick={handleUploadPhoto}
              disabled={isUploadingPhoto || isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 rounded-xl text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-widest disabled:opacity-60 transition-colors"
            >
              {isUploadingPhoto ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              {isUploadingPhoto ? "Uploading to imgbb…" : "Upload cover to imgbb"}
            </button>
          )}
        </div>

        {/* Student Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Student Name</label>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
            <User className="w-4.5 h-4.5 text-slate-500 mr-2.5" />
            <input
              type="text"
              {...register("name", { required: "Student name is required" })}
              placeholder="e.g. Demetrius Combs"
              className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono"
            />
          </div>
          {errors.name && <span className="text-red-400 text-[10px] font-mono">{errors.name.message}</span>}
        </div>

        {/* Student ID */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Student ID</label>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
            <CreditCard className="w-4.5 h-4.5 text-slate-500 mr-2.5" />
            <input
              type="text"
              {...register("studentId", { required: "Student ID is required" })}
              placeholder="e.g. 23020101"
              className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono"
            />
          </div>
          {errors.studentId && <span className="text-red-400 text-[10px] font-mono">{errors.studentId.message}</span>}
        </div>

        {/* University Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">University Email</label>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
            <Mail className="w-4.5 h-4.5 text-slate-500 mr-2.5" />
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="e.g. xive@mailinator.com"
              className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono"
            />
          </div>
          {errors.email && <span className="text-red-400 text-[10px] font-mono">{errors.email.message}</span>}
        </div>

        {/* Academic Department */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Academic Department</label>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
            <BookOpen className="w-4.5 h-4.5 text-slate-500 mr-2.5" />
            <select
              {...register("department")}
              defaultValue="Geology"
              className="bg-transparent text-xs text-white outline-none w-full font-mono border-none"
            >
              <option value="CSE" className="bg-[#03070E]">CSE (Computer Science & Engineering)</option>
              <option value="EEE" className="bg-[#03070E]">EEE (Electrical & Electronic Engineering)</option>
              <option value="Social Work" className="bg-[#03070E]">Social Work</option>
              <option value="Management" className="bg-[#03070E]">Management</option>
              <option value="Geology" className="bg-[#03070E]">Geology</option>
              <option value="Fisheries" className="bg-[#03070E]">Fisheries</option>
              <option value="Math" className="bg-[#03070E]">Math (Mathematics)</option>
            </select>
          </div>
        </div>

        {/* Set Portal Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Set Portal Password</label>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
            <Lock className="w-4.5 h-4.5 text-slate-500 mr-2.5" />
            <input
              type="password"
              {...register("password", { 
                required: "Password is required", 
                minLength: { value: 6, message: "Password must be at least 6 characters" } 
              })}
              placeholder="••••••••"
              className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono"
            />
          </div>
          {errors.password && <span className="text-red-400 text-[10px] font-mono">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isLoading ? "Writing registry shard..." : "Enroll Node Shard"}</span>
        </button>
      </form>

      <div className="text-center text-xs">
        <span className="text-slate-500">Already registered? </span>
        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold">Portal Ingress</Link>
      </div>
    </div>
  );
}
