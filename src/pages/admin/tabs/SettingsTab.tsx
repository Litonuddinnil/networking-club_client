import React from "react";
import { CheckCircle, Globe, Lock, Save, Sliders } from "lucide-react";

export interface AppSettings {
  language: string;
  allowRegistration: boolean;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  themeAccent: string;
  autoBackup: boolean;
}

interface SettingsTabProps {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
  onSave: () => void;
}

export default function SettingsTab({ settings, onChange, onSave }: SettingsTabProps) {
  const isBn = settings.language === "bn";

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-3xl space-y-8 font-mono text-xs animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>{isBn ? "পোর্টাল সিস্টেম কনফিগারেশন" : "System & Portal Configuration"}</span>
          </h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            {isBn
              ? "গ্লোবাল এক্সেস, নোটিফিকেশন এবং ইন্টারফেস ভাষা সেটিংস"
              : "Manage global access, language, and system preferences."}
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Save className="w-4 h-4" />
          <span>{isBn ? "সেভ করুন" : "Save Changes"}</span>
        </button>
      </div>

      {/* Language */}
      <section className="space-y-4">
        <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-2 uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          <span>{isBn ? "ভাষা নির্বাচন" : "Localization & Language"}</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LangCard
            selected={settings.language === "en"}
            onClick={() => onChange({ ...settings, language: "en" })}
            title="English"
            sub="(US Standard)"
          />
          <LangCard
            selected={settings.language === "bn"}
            onClick={() => onChange({ ...settings, language: "bn" })}
            title="বাংলা"
            sub="(Bangla Native)"
            fontSans
          />
        </div>
      </section>

      {/* Access & Security */}
      <section className="space-y-4 pt-2">
        <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-2 uppercase tracking-wider">
          <Lock className="w-4 h-4" />
          <span>{isBn ? "এক্সেস এবং সিকিউরিটি" : "Access & Security Control"}</span>
        </h4>
        <div className="space-y-3">
          <ToggleRow
            title={isBn ? "পাবলিক রেজিস্ট্রেশন অনুমোদন" : "Allow Public Registration"}
            desc={
              isBn
                ? "নতুন শিক্ষার্থীদের পোর্টাল রেজিস্ট্রেশনের অনুমতি দিন"
                : "Enable or disable new user signups"
            }
            checked={settings.allowRegistration}
            onChange={(v) => onChange({ ...settings, allowRegistration: v })}
          />
          <ToggleRow
            title={isBn ? "ইমেইল নোটিফিকেশন সার্ভিস" : "System Email Notifications"}
            desc={
              isBn
                ? "নতুন অ্যাক্টিভিটির ইমেইল অ্যালার্ট পাঠাবে"
                : "Send system updates and alerts"
            }
            checked={settings.emailNotifications}
            onChange={(v) => onChange({ ...settings, emailNotifications: v })}
          />
          <ToggleRow
            title={isBn ? "মেইনটেন্যান্স মোড" : "Maintenance Mode"}
            desc={
              isBn
                ? "সাময়িকভাবে পোর্টাল ব্যবহার সীমিত রাখুন"
                : "Temporarily lock down the portal for maintenance"
            }
            checked={settings.maintenanceMode}
            onChange={(v) => onChange({ ...settings, maintenanceMode: v })}
          />
          <ToggleRow
            title={isBn ? "অটো ব্যাকআপ" : "Automatic Daily Backup"}
            desc={isBn ? "প্রতিদিন ডাটাবেসের ব্যাকআপ নেওয়া হবে" : "Daily backup of the database"}
            checked={settings.autoBackup}
            onChange={(v) => onChange({ ...settings, autoBackup: v })}
          />
        </div>
      </section>
    </div>
  );
}

function LangCard({
  selected,
  onClick,
  title,
  sub,
  fontSans,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  fontSans?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
        selected
          ? "bg-emerald-500/10 border-emerald-500 text-foreground shadow-md shadow-emerald-500/10"
          : "bg-background/60 border-white/10 text-muted-foreground hover:border-white/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`font-bold text-sm ${fontSans ? "font-sans" : ""}`}>{title}</span>
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      </div>
      {selected && <CheckCircle className="w-4 h-4 text-emerald-400" />}
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between p-4 bg-background/60 rounded-2xl border border-white/10 cursor-pointer hover:border-white/20 transition">
      <div className="pr-4">
        <div className="font-bold text-foreground">{title}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}