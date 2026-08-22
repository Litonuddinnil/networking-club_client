 import React, { useState } from "react";
import {
  Settings,
  Bell,
  Eye,
  Shield,
  Check,
  Mail,
  Trophy,
  Download,
  KeyRound,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { SettingsTabProps, MemberSettingsState, StudentProfile } from "./memberTabUtils";

export default function MemberSettingsView({
  dataWarning,
  student,
  onSaveSettings,
}: SettingsTabProps) {
  // Dynamic Settings State
  const [settings, setSettings] = useState<MemberSettingsState>({
    emailNotifications: true,
    eventReminders: true,
    paymentAlerts: true,
    leaderboardVisibility: true,
    showContactInfo: false,
    autoCheckInPass: true,
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // Toggle handler with automatic feedback
  const handleToggle = (key: keyof MemberSettingsState) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (onSaveSettings) onSaveSettings(next);
      return next;
    });

    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    const defaultSettings: MemberSettingsState = {
      emailNotifications: true,
      eventReminders: true,
      paymentAlerts: true,
      leaderboardVisibility: true,
      showContactInfo: false,
      autoCheckInPass: true,
    };
    setSettings(defaultSettings);
    if (onSaveSettings) onSaveSettings(defaultSettings);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  // Dynamic active count
  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <>
      {dataWarning}

      <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-6 text-white">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Settings className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold tracking-tight text-white">
                Member Portal Settings
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Manage your notifications, privacy preferences, and account controls.
              </p>
            </div>
          </div>

          {/* Dynamic Auto-Save Indicator */}
          <div className="flex items-center gap-2">
            {saveStatus === "saved" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Preferences Saved
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-500">
                {activeCount} of 6 active
              </span>
            )}
          </div>
        </header>

        {/* Section 1: Notifications */}
        <section className="bg-[#03070E] border border-white/10 rounded-3xl p-5 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/5 pb-3">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>Communication &amp; Notifications</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <SettingToggle
              label="Email Announcements & Updates"
              description="Receive official club circulars, newsletters, and notice board alerts"
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              enabled={settings.emailNotifications}
              onToggle={() => handleToggle("emailNotifications")}
            />

            <SettingToggle
              label="Event Schedule Reminders"
              description="Receive alert notifications 24 hours before your registered workshops"
              icon={<Sparkles className="w-4 h-4 text-slate-400" />}
              enabled={settings.eventReminders}
              onToggle={() => handleToggle("eventReminders")}
            />

            <SettingToggle
              label="Dues & Payment Confirmations"
              description="Email alerts for approved fee submissions and monthly receipts"
              icon={<Shield className="w-4 h-4 text-slate-400" />}
              enabled={settings.paymentAlerts}
              onToggle={() => handleToggle("paymentAlerts")}
            />
          </div>
        </section>

        {/* Section 2: Privacy & Community Leaderboard */}
        <section className="bg-[#03070E] border border-white/10 rounded-3xl p-5 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/5 pb-3">
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Privacy &amp; Leaderboard Visibility</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <SettingToggle
              label="Public Merit Leaderboard Standing"
              description="Showcase your XP score, rank badge, and attendance record publicly"
              icon={<Trophy className="w-4 h-4 text-amber-400" />}
              enabled={settings.leaderboardVisibility}
              onToggle={() => handleToggle("leaderboardVisibility")}
            />

            <SettingToggle
              label="Show Contact Info on Digital Pass"
              description="Display email address and phone number on your shared Digital ID Card"
              icon={<Eye className="w-4 h-4 text-slate-400" />}
              enabled={settings.showContactInfo}
              onToggle={() => handleToggle("showContactInfo")}
            />
          </div>
        </section>

        {/* Section 3: Account & Data Actions */}
        <section className="bg-[#03070E] border border-white/10 rounded-3xl p-5 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/5 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security &amp; Account Actions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/5 border border-white/10 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Reset All Defaults</span>
              </div>
              <span className="text-[10px] text-slate-500">Restore</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Password reset link sent to your registered email.")}
              className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/5 border border-white/10 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Change Password</span>
              </div>
              <span className="text-[10px] text-slate-500">Update</span>
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

/* Custom Animated Switch Component */
function SettingToggle({
  label,
  description,
  icon,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-950/70 rounded-2xl border border-white/5 hover:border-white/10 transition-colors gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="space-y-0.5">
          <div className="font-bold text-white text-xs">{label}</div>
          <div className="text-[11px] text-slate-400 font-sans leading-tight">
            {description}
          </div>
        </div>
      </div>

      {/* Custom Switch Button */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? "bg-emerald-500" : "bg-slate-800"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}