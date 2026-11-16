import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings, Globe, Mail, Search, Palette } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { PasswordInput } from "../components/ui/password-input";
import { Label } from "../components/ui/label";
import {
  useGetSettingsQuery,
  useUpdateGeneralMutation,
  useUpdateSeoMutation,
  useUpdateSmtpMutation,
  useUpdateLocalizationMutation,
  useUpdateThemeMutation,
} from "../features/settings/settingsApi";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { data: settings, isLoading } = useGetSettingsQuery();

  const TABS = [
    { id: "general",      label: "General",      icon: Settings },
    { id: "seo",          label: "SEO",          icon: Search },
    { id: "smtp",         label: "SMTP",         icon: Mail },
    { id: "localization", label: "Localization", icon: Globe },
    { id: "theme",        label: "Theme",        icon: Palette },
  ];

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const props = { settings };

  return (
    <>
      <PanelHelmet title="Settings" />
      <div className="flex gap-6">
        <nav className="w-44 shrink-0 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeTab === id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          {activeTab === "general" && <GeneralTab {...props} />}
          {activeTab === "seo" && <SeoTab {...props} />}
          {activeTab === "smtp" && <SmtpTab {...props} />}
          {activeTab === "localization" && <LocalizationTab {...props} />}
          {activeTab === "theme" && <ThemeTab {...props} />}
        </div>
      </div>
    </>
  );
}

function GeneralTab({ settings }) {
  const raw = settings?.general ? (typeof settings.general === "string" ? JSON.parse(settings.general) : settings.general) : {};
  const [form, setForm] = useState({ siteName: "", email: "", phone: "", address: "", siteBaseUrl: "", subscriptionEnabled: false, contactAutoReplyEnabled: false, contactAutoReplySubject: "", contactAutoReplyBody: "", ...raw });
  const [update, { isLoading }] = useUpdateGeneralMutation();

  useEffect(() => { if (raw.siteName !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success("General settings saved."); }
    catch { toast.error("Save failed."); }
  }

  return (
    <SettingsForm title="General Settings" onSubmit={handleSubmit} isLoading={isLoading}>
      <Field label="Site Name" placeholder="e.g. My Company Ltd." value={form.siteName} onChange={(v) => setForm((f) => ({ ...f, siteName: v }))} />
      <Field label="Email" placeholder="info@company.com" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
      <Field label="Phone" placeholder="+90 212 000 00 00" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
      <Field label="Address" placeholder="City, Country" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
      <Field label="Site URL" placeholder="https://www.company.com" value={form.siteBaseUrl} onChange={(v) => setForm((f) => ({ ...f, siteBaseUrl: v }))} />
      {/* Abonelik toggle */}
      <ToggleSetting
        label="Subscription System"
        description="When disabled, /api/public/subscribe returns 503 and no new subscriptions are accepted."
        checked={form.subscriptionEnabled}
        onChange={() => setForm((f) => ({ ...f, subscriptionEnabled: !f.subscriptionEnabled }))}
      />
      {/* Contact form auto-reply */}
      <ToggleSetting
        label="Contact Form Auto-Reply"
        description="When a visitor submits the contact form, an automatic thank-you email is sent."
        checked={form.contactAutoReplyEnabled}
        onChange={() => setForm((f) => ({ ...f, contactAutoReplyEnabled: !f.contactAutoReplyEnabled }))}
      />
      {form.contactAutoReplyEnabled && (
        <>
          <Field
            label="Auto-Reply Subject"
            placeholder="Your message has been received — thank you!"
            value={form.contactAutoReplySubject}
            onChange={(v) => setForm((f) => ({ ...f, contactAutoReplySubject: v }))}
          />
          <div className="space-y-1.5">
            <Label>Auto-Reply Content (HTML)</Label>
            <textarea
              rows={5}
              placeholder="<p>Hello, your message has been received. We will get back to you shortly.</p>"
              value={form.contactAutoReplyBody}
              onChange={(e) => setForm((f) => ({ ...f, contactAutoReplyBody: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </div>
        </>
      )}
    </SettingsForm>
  );
}

function SeoTab({ settings }) {
  const raw = settings?.seo ? (typeof settings.seo === "string" ? JSON.parse(settings.seo) : settings.seo) : {};
  const [form, setForm] = useState({ titleTemplate: "", defaultDescription: "", googleAnalyticsId: "", googleTagManagerId: "", ...raw });
  const [update, { isLoading }] = useUpdateSeoMutation();

  useEffect(() => { if (raw.titleTemplate !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success("SEO settings saved."); }
    catch { toast.error("Save failed."); }
  }

  return (
    <SettingsForm title="SEO Settings" onSubmit={handleSubmit} isLoading={isLoading}>
      <Field label="Title Template" placeholder="| Site Name" value={form.titleTemplate} onChange={(v) => setForm((f) => ({ ...f, titleTemplate: v }))} />
      <Field label="Default Meta Description" placeholder="150-character description of your site" value={form.defaultDescription} onChange={(v) => setForm((f) => ({ ...f, defaultDescription: v }))} />
      <Field label="Google Analytics ID" placeholder="G-XXXXXXXXXX" value={form.googleAnalyticsId} onChange={(v) => setForm((f) => ({ ...f, googleAnalyticsId: v }))} />
      <Field label="Google Tag Manager ID" placeholder="GTM-XXXXXXX" value={form.googleTagManagerId} onChange={(v) => setForm((f) => ({ ...f, googleTagManagerId: v }))} />
    </SettingsForm>
  );
}

function SmtpTab({ settings }) {
  const raw = settings?.smtp ? (typeof settings.smtp === "string" ? JSON.parse(settings.smtp) : settings.smtp) : {};
  const [form, setForm] = useState({ host: "", port: 587, username: "", password: "", fromEmail: "", fromName: "", useSsl: true, ...raw });
  const [update, { isLoading }] = useUpdateSmtpMutation();

  useEffect(() => { if (raw.host !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success("SMTP settings saved."); }
    catch { toast.error("Save failed."); }
  }

  return (
    <SettingsForm title="SMTP Settings" onSubmit={handleSubmit} isLoading={isLoading}>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>Host</Label>
          <Input placeholder="smtp.gmail.com" value={form.host} onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Port</Label>
          <Input type="number" value={form.port} onChange={(e) => setForm((f) => ({ ...f, port: +e.target.value }))} />
        </div>
      </div>
      <Field label="Username" placeholder="sender@example.com" value={form.username} onChange={(v) => setForm((f) => ({ ...f, username: v }))} />
      <div className="space-y-1.5">
        <Label>Password <span className="text-muted-foreground text-xs">(fill to change)</span></Label>
        <PasswordInput placeholder="Enter new password to change" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
      </div>
      <Field label="From Email" placeholder="noreply@company.com" value={form.fromEmail} onChange={(v) => setForm((f) => ({ ...f, fromEmail: v }))} />
      <Field label="From Name" placeholder="NEXUS CMS" value={form.fromName} onChange={(v) => setForm((f) => ({ ...f, fromName: v }))} />
      <label className="flex items-center gap-2 cursor-pointer text-sm">
        <input type="checkbox" checked={form.useSsl} onChange={(e) => setForm((f) => ({ ...f, useSsl: e.target.checked }))} className="rounded" />
        Use SSL
      </label>
    </SettingsForm>
  );
}

function LocalizationTab({ settings }) {
  const raw = settings?.localization ? (typeof settings.localization === "string" ? JSON.parse(settings.localization) : settings.localization) : {};
  const [form, setForm] = useState({ defaultLanguage: "en", dateFormat: "MM/dd/yyyy", timeZone: "UTC", ...raw });
  const [update, { isLoading }] = useUpdateLocalizationMutation();

  useEffect(() => { if (raw.defaultLanguage !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success("Localization settings saved."); }
    catch { toast.error("Save failed."); }
  }

  return (
    <SettingsForm title="Localization" onSubmit={handleSubmit} isLoading={isLoading}>
      <Field label="Default Language" value={form.defaultLanguage} onChange={(v) => setForm((f) => ({ ...f, defaultLanguage: v }))} />
      <Field label="Date Format" placeholder="MM/dd/yyyy" value={form.dateFormat} onChange={(v) => setForm((f) => ({ ...f, dateFormat: v }))} />
      <Field label="Timezone" placeholder="UTC" value={form.timeZone} onChange={(v) => setForm((f) => ({ ...f, timeZone: v }))} />
    </SettingsForm>
  );
}

function ThemeTab({ settings }) {
  const raw = settings?.theme ? (typeof settings.theme === "string" ? JSON.parse(settings.theme) : settings.theme) : {};
  const [form, setForm] = useState({ primaryColor: "#3b82f6", font: "Inter", ...raw });
  const [update, { isLoading }] = useUpdateThemeMutation();

  useEffect(() => { if (raw.primaryColor !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success("Theme settings saved."); }
    catch { toast.error("Save failed."); }
  }

  return (
    <SettingsForm title="Theme" onSubmit={handleSubmit} isLoading={isLoading}>
      <div className="space-y-1.5">
        <Label>Primary Color</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={form.primaryColor} onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
            className="w-10 h-10 rounded cursor-pointer border" />
          <Input value={form.primaryColor} onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))} className="w-32" />
        </div>
      </div>
      <Field label="Font" placeholder="Inter" value={form.font} onChange={(v) => setForm((f) => ({ ...f, font: v }))} />
    </SettingsForm>
  );
}

function SettingsForm({ title, children, onSubmit, isLoading }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="px-5 py-4 border-b">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <form onSubmit={onSubmit} className="p-5 space-y-4">
        {children}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring shrink-0 ml-4 ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
