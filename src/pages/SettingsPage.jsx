import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");
  const { data: settings, isLoading } = useGetSettingsQuery();

  const TABS = [
    { id: "general",      label: t("settings.general"),      icon: Settings },
    { id: "seo",          label: t("settings.seo"),          icon: Search },
    { id: "smtp",         label: t("settings.smtp"),         icon: Mail },
    { id: "localization", label: t("settings.localization"), icon: Globe },
    { id: "theme",        label: t("settings.theme"),        icon: Palette },
  ];

  if (isLoading) return <div className="text-sm text-muted-foreground">{t("common.loading")}</div>;

  const props = { settings };

  return (
    <>
      <PanelHelmet title={t("settings.title")} />
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
  const { t } = useTranslation();
  const raw = settings?.general ? (typeof settings.general === "string" ? JSON.parse(settings.general) : settings.general) : {};
  const [form, setForm] = useState({ siteName: "", email: "", phone: "", address: "", siteBaseUrl: "", subscriptionEnabled: false, contactAutoReplyEnabled: false, contactAutoReplySubject: "", contactAutoReplyBody: "", ...raw });
  const [update, { isLoading }] = useUpdateGeneralMutation();

  useEffect(() => { if (raw.siteName !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success(t("settingsExtra.generalSaved")); }
    catch { toast.error(t("settingsExtra.saveFailed")); }
  }

  return (
    <SettingsForm title={t("settingsExtra.generalTitle")} onSubmit={handleSubmit} isLoading={isLoading}>
      <Field label={t("settings.siteName")} placeholder="örn. Şirketim A.Ş." value={form.siteName} onChange={(v) => setForm((f) => ({ ...f, siteName: v }))} />
      <Field label={t("settings.email")} placeholder="info@sirket.com" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
      <Field label={t("settings.phone")} placeholder="+90 212 000 00 00" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
      <Field label={t("settings.address")} placeholder="İstanbul, Türkiye" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
      <Field label={t("settingsExtra.siteBaseUrl", "Site URL")} placeholder="https://www.sirket.com" value={form.siteBaseUrl} onChange={(v) => setForm((f) => ({ ...f, siteBaseUrl: v }))} />
      {/* Abonelik toggle */}
      <ToggleSetting
        label={t("settingsExtra.subscriptionEnabled", "Abonelik Sistemi")}
        description={t("settingsExtra.subscriptionEnabledDesc", "Kapalıyken /api/public/subscribe endpoint'i 503 döner, yeni abonelik alınmaz.")}
        checked={form.subscriptionEnabled}
        onChange={() => setForm((f) => ({ ...f, subscriptionEnabled: !f.subscriptionEnabled }))}
      />
      {/* İletişim formu otomatik yanıt */}
      <ToggleSetting
        label={t("settingsExtra.contactAutoReply", "İletişim Formu Otomatik Yanıt")}
        description={t("settingsExtra.contactAutoReplyDesc", "Ziyaretçi iletişim formu gönderdiğinde otomatik bir teşekkür maili gönderilir.")}
        checked={form.contactAutoReplyEnabled}
        onChange={() => setForm((f) => ({ ...f, contactAutoReplyEnabled: !f.contactAutoReplyEnabled }))}
      />
      {form.contactAutoReplyEnabled && (
        <>
          <Field
            label={t("settingsExtra.contactAutoReplySubject", "Otomatik Yanıt Konusu")}
            placeholder="Mesajınız alındı — teşekkürler!"
            value={form.contactAutoReplySubject}
            onChange={(v) => setForm((f) => ({ ...f, contactAutoReplySubject: v }))}
          />
          <div className="space-y-1.5">
            <Label>{t("settingsExtra.contactAutoReplyBody", "Otomatik Yanıt İçeriği (HTML)")}</Label>
            <textarea
              rows={5}
              placeholder="<p>Merhaba, mesajınız alındı. En kısa sürede dönüş yapacağız.</p>"
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
  const { t } = useTranslation();
  const raw = settings?.seo ? (typeof settings.seo === "string" ? JSON.parse(settings.seo) : settings.seo) : {};
  const [form, setForm] = useState({ titleTemplate: "", defaultDescription: "", googleAnalyticsId: "", googleTagManagerId: "", ...raw });
  const [update, { isLoading }] = useUpdateSeoMutation();

  useEffect(() => { if (raw.titleTemplate !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success(t("settingsExtra.seoSaved")); }
    catch { toast.error(t("settingsExtra.saveFailed")); }
  }

  return (
    <SettingsForm title={t("settingsExtra.seoTitle")} onSubmit={handleSubmit} isLoading={isLoading}>
      <Field label={t("settingsExtra.titleTemplate")} placeholder="| Site Adı" value={form.titleTemplate} onChange={(v) => setForm((f) => ({ ...f, titleTemplate: v }))} />
      <Field label={t("settingsExtra.defaultDesc")} placeholder="Sitenizi kısaca tanımlayan 150 karakterlik metin" value={form.defaultDescription} onChange={(v) => setForm((f) => ({ ...f, defaultDescription: v }))} />
      <Field label={t("settingsExtra.analyticsId")} placeholder="G-XXXXXXXXXX" value={form.googleAnalyticsId} onChange={(v) => setForm((f) => ({ ...f, googleAnalyticsId: v }))} />
      <Field label={t("settingsExtra.tagManagerId")} placeholder="GTM-XXXXXXX" value={form.googleTagManagerId} onChange={(v) => setForm((f) => ({ ...f, googleTagManagerId: v }))} />
    </SettingsForm>
  );
}

function SmtpTab({ settings }) {
  const { t } = useTranslation();
  const raw = settings?.smtp ? (typeof settings.smtp === "string" ? JSON.parse(settings.smtp) : settings.smtp) : {};
  const [form, setForm] = useState({ host: "", port: 587, username: "", password: "", fromEmail: "", fromName: "", useSsl: true, ...raw });
  const [update, { isLoading }] = useUpdateSmtpMutation();

  useEffect(() => { if (raw.host !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success(t("settingsExtra.smtpSaved")); }
    catch { toast.error(t("settingsExtra.saveFailed")); }
  }

  return (
    <SettingsForm title={t("settingsExtra.smtpTitle")} onSubmit={handleSubmit} isLoading={isLoading}>
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
      <Field label={t("settingsExtra.username")} placeholder="gönderen@gmail.com" value={form.username} onChange={(v) => setForm((f) => ({ ...f, username: v }))} />
      <div className="space-y-1.5">
        <Label>{t("auth.password")} <span className="text-muted-foreground text-xs">{t("settingsExtra.passwordHint")}</span></Label>
        <PasswordInput placeholder={t("settingsExtra.passwordPlaceholder")} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
      </div>
      <Field label={t("settingsExtra.fromEmail")} placeholder="noreply@sirket.com" value={form.fromEmail} onChange={(v) => setForm((f) => ({ ...f, fromEmail: v }))} />
      <Field label={t("settingsExtra.fromName")} placeholder="NEXUS CMS" value={form.fromName} onChange={(v) => setForm((f) => ({ ...f, fromName: v }))} />
      <label className="flex items-center gap-2 cursor-pointer text-sm">
        <input type="checkbox" checked={form.useSsl} onChange={(e) => setForm((f) => ({ ...f, useSsl: e.target.checked }))} className="rounded" />
        {t("settingsExtra.useSsl")}
      </label>
    </SettingsForm>
  );
}

function LocalizationTab({ settings }) {
  const { t } = useTranslation();
  const raw = settings?.localization ? (typeof settings.localization === "string" ? JSON.parse(settings.localization) : settings.localization) : {};
  const [form, setForm] = useState({ defaultLanguage: "tr", dateFormat: "dd.MM.yyyy", timeZone: "Europe/Istanbul", ...raw });
  const [update, { isLoading }] = useUpdateLocalizationMutation();

  useEffect(() => { if (raw.defaultLanguage !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success(t("settingsExtra.localizationSaved")); }
    catch { toast.error(t("settingsExtra.saveFailed")); }
  }

  return (
    <SettingsForm title={t("settingsExtra.localizationTitle")} onSubmit={handleSubmit} isLoading={isLoading}>
      <Field label={t("settingsExtra.defaultLang")} value={form.defaultLanguage} onChange={(v) => setForm((f) => ({ ...f, defaultLanguage: v }))} />
      <Field label={t("settingsExtra.dateFormat")} placeholder="dd.MM.yyyy" value={form.dateFormat} onChange={(v) => setForm((f) => ({ ...f, dateFormat: v }))} />
      <Field label={t("settingsExtra.timezone")} placeholder="Europe/Istanbul" value={form.timeZone} onChange={(v) => setForm((f) => ({ ...f, timeZone: v }))} />
    </SettingsForm>
  );
}

function ThemeTab({ settings }) {
  const { t } = useTranslation();
  const raw = settings?.theme ? (typeof settings.theme === "string" ? JSON.parse(settings.theme) : settings.theme) : {};
  const [form, setForm] = useState({ primaryColor: "#3b82f6", font: "Inter", ...raw });
  const [update, { isLoading }] = useUpdateThemeMutation();

  useEffect(() => { if (raw.primaryColor !== undefined) setForm((f) => ({ ...f, ...raw })); }, [settings]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    try { await update(form).unwrap(); toast.success(t("settingsExtra.themeSaved")); }
    catch { toast.error(t("settingsExtra.saveFailed")); }
  }

  return (
    <SettingsForm title={t("settingsExtra.themeTitle")} onSubmit={handleSubmit} isLoading={isLoading}>
      <div className="space-y-1.5">
        <Label>{t("settingsExtra.primaryColor")}</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={form.primaryColor} onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
            className="w-10 h-10 rounded cursor-pointer border" />
          <Input value={form.primaryColor} onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))} className="w-32" />
        </div>
      </div>
      <Field label={t("settingsExtra.font")} placeholder="Inter" value={form.font} onChange={(v) => setForm((f) => ({ ...f, font: v }))} />
    </SettingsForm>
  );
}

function SettingsForm({ title, children, onSubmit, isLoading }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border bg-card">
      <div className="px-5 py-4 border-b">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <form onSubmit={onSubmit} className="p-5 space-y-4">
        {children}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>{isLoading ? t("settingsExtra.saving") : t("settingsExtra.save")}</Button>
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
