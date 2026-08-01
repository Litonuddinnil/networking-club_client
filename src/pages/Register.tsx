import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../provider/AuthProvider";
import { ShieldAlert, UserPlus, Lock, Mail, User, BookOpen, CreditCard } from "lucide-react";
import { useAxiosPublic } from "../hooks/useAxiosPublic";
import Swal from "sweetalert2";

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
  const axiosPublic = useAxiosPublic();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    setLocalError(null);

    try {
      // 1. Firebase Register
      await registerAuth(
        data.email,
        data.password,
        data.name,
        data.department
      ); 
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedMemberId = `JNC-${new Date().getFullYear()}-${randomNum}`;
      const currentIsoTime = new Date().toISOString(); 
       
      const memberPayload = {
        memberId: generatedMemberId,
        studentId: data.studentId,
        name: data.name,
        email: data.email,
        photoURL: "",
        department: data.department,
        role: "member",
        status: "pending",
        xp: 0,
        joinedDate: currentIsoTime,
        lastLogin: null,
        createdAt: currentIsoTime,
        updatedAt: currentIsoTime,
      };

      // 3. Save the complete member profile
      await axiosPublic.post("/api/members", memberPayload);

      // Success Alert
      await Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: `Your Member ID is ${generatedMemberId}. Waiting for admin approval.`,
        background: "#03070E",
        color: "#ffffff",
        confirmButtonColor: "#ea580c",
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
        confirmButtonColor: "#ea580c",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#03070E]/90 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 to-transparent pointer-events-none" />

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
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-orange-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isLoading ? "Writing registry shard..." : "Enroll Node Shard"}</span>
        </button>
      </form>

      <div className="text-center text-xs">
        <span className="text-slate-500">Already registered? </span>
        <Link to="/login" className="text-orange-500 hover:text-orange-400 font-bold">Portal Ingress</Link>
      </div>
    </div>
  );
}
