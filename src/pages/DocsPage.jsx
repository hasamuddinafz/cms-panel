import { useState } from "react";
import {
  BookOpen, Layers, FileText, Image, Shield, Settings,
  Menu, Globe, ChevronRight, Info, Lightbulb, Terminal,
  CheckCircle, AlertCircle, Inbox, Rss,
} from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import { cn } from "../lib/utils";

/* ─── Nav sections ─── */
const SECTIONS = [
  { id: "overview",     label: "Overview",               icon: BookOpen },
  { id: "page-models",  label: "Creating Page Models",   icon: Layers },
  { id: "content",      label: "Content Management",     icon: FileText },
  { id: "media",        label: "Uploading Media",        icon: Image },
  { id: "roles",        label: "Roles & Permissions",    icon: Shield },
  { id: "settings",     label: "Settings",               icon: Settings },
  { id: "menus",        label: "Menu Management",        icon: Menu },
  { id: "contact",      label: "Contact & Mail",         icon: Inbox },
  { id: "subscribers",  label: "Subscribers",            icon: Rss },
  { id: "api",          label: "Public API",             icon: Terminal },
];

/* ─── Shared doc components ─── */
function DocH1({ children }) {
  return <h1 className="text-2xl font-bold text-foreground mb-1">{children}</h1>;
}
function DocH2({ children }) {
  return <h2 className="text-base font-semibold text-foreground mt-8 mb-3 pb-2 border-b">{children}</h2>;
}
function DocP({ children }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>;
}
function DocLead({ children }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-6 border-l-2 border-primary/40 pl-3">{children}</p>;
}
function DocTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-sm">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function DocCode({ children }) {
  return <code className="bg-muted text-primary rounded px-1.5 py-0.5 text-xs font-mono">{children}</code>;
}
function DocCodeBlock({ children }) {
  return (
    <pre className="bg-sidebar text-sidebar-foreground rounded-xl p-4 text-xs font-mono overflow-x-auto my-4 leading-relaxed">
      {children}
    </pre>
  );
}
function DocTip({ children }) {
  return (
    <div className="flex gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 my-4">
      <Lightbulb size={16} className="text-primary mt-0.5 shrink-0" />
      <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>
    </div>
  );
}
function DocWarning({ children }) {
  return (
    <div className="flex gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4 my-4">
      <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
      <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>
    </div>
  );
}
function DocInfo({ children }) {
  return (
    <div className="flex gap-3 bg-muted border rounded-xl p-4 my-4">
      <Info size={16} className="text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
function DocStep({ number, title, children }) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        {number}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
function DocBadge({ children, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    green:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    gray:   "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5", colors[color])}>
      {children}
    </span>
  );
}

/* ─── Section content components ─── */
function SectionOverview() {
  return (
    <div>
      <DocH1>NEXUS CMS — User Guide</DocH1>
      <DocLead>
        A headless, API-first content management system that lets you manage your
        organization's website content from a single admin panel.
      </DocLead>

      <DocH2>Core Concepts</DocH2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[
          { icon: Layers,   title: "Page Model",         desc: "Defines the schema of a page type: which sections and fields it contains." },
          { icon: FileText, title: "Content (Instance)",  desc: "A filled-in page model. Every blog post, for example, is one instance." },
          { icon: Image,    title: "Media",               desc: "Uploaded images, documents and videos are managed in one place. Drag & drop is supported." },
          { icon: Menu,     title: "Menu",                desc: "The site's navigation structure, defined separately for navbar and footer." },
          { icon: Shield,   title: "Role / Permission",   desc: "Determines which user can perform which action." },
          { icon: Globe,    title: "Language",            desc: "Multi-language content. Translatable fields are entered separately for each language." },
          { icon: Inbox,    title: "Contact & Mail",      desc: "Visitor messages, auto-reply, mail templates and bulk newsletters." },
          { icon: Rss,      title: "Subscribers",         desc: "Turn the subscription system on/off and manage the subscriber list." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-3 p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <DocH2>Quick Start</DocH2>
      <DocStep number={1} title="Create a page model">
        Go to <strong>Page Models</strong> in the left menu and define your site's content structure.
      </DocStep>
      <DocStep number={2} title="Enter content">
        Pick a model under <strong>Content</strong> and fill in your page. Multi-language support is enabled automatically.
      </DocStep>
      <DocStep number={3} title="Publish">
        Save as a draft, and when it's ready click <DocCode>Publish</DocCode>.
      </DocStep>
      <DocStep number={4} title="Consume it from the Public API">
        Your frontend fetches the content from <DocCode>/api/public/pages/{"{modelKey}/{slug}"}</DocCode>.
      </DocStep>
    </div>
  );
}

function SectionPageModels() {
  return (
    <div>
      <DocH1>Creating Page Models</DocH1>
      <DocLead>A page model defines the schema of a page type. It is created from the panel — no code required.</DocLead>

      <DocH2>Step by Step</DocH2>
      <DocStep number={1} title="Go to Page Models">
        Select <strong>Page Models</strong> from the left menu.
      </DocStep>
      <DocStep number={2} title="Click New Model">
        Click the <DocCode>+ New Model</DocCode> button at the top right.
      </DocStep>
      <DocStep number={3} title="Fill in the basics">
        Enter a name, key, description and icon.
      </DocStep>
      <DocStep number={4} title="Define sections and fields">
        Add sections and fields with the builder (the resulting schema is shown below).
      </DocStep>

      <DocTable
        headers={["Field", "Example", "Description"]}
        rows={[
          ["Name", "Blog Post", "Human-readable model name"],
          ["Key", "blog-post", "URL-friendly, lowercase, hyphen-separated"],
          ["Singleton", "✓ checked", "If checked, only 1 content item can be created"],
          ["Icon", "FileText", "Lucide icon name (PascalCase)"],
        ]}
      />

      <DocH2>Supported Field Types</DocH2>
      <DocTable
        headers={["Type", "Use", "Panel Component"]}
        rows={[
          [<DocCode>text</DocCode>, "Single-line text", "Input"],
          [<DocCode>textarea</DocCode>, "Multi-line text", "Textarea"],
          [<DocCode>richtext</DocCode>, "Rich text", "TipTap Editor"],
          [<DocCode>asset</DocCode>, "Image / Document / Video", "Media Picker Modal"],
          [<DocCode>boolean</DocCode>, "On/Off", "Toggle Switch"],
          [<DocCode>select</DocCode>, "Fixed options", "Dropdown"],
          [<DocCode>repeater</DocCode>, "Repeatable field group", "Drag & drop list"],
          [<DocCode>link</DocCode>, "URL + label + target", "Link Picker"],
          [<DocCode>icon</DocCode>, "Lucide icon picker", "Icon Grid"],
          [<DocCode>date</DocCode>, "Date/Time", "Date Picker"],
          [<DocCode>number</DocCode>, "Number", "Number Input"],
        ]}
      />

      <DocH2>Schema JSON Example</DocH2>
      <DocCodeBlock>{`{
  "sections": [
    {
      "key": "hero",
      "label": "Hero",
      "repeatable": false,
      "fields": [
        { "key": "title", "type": "text", "label": "Title", "translatable": true, "required": true },
        { "key": "image", "type": "asset", "label": "Image", "assetType": "image" },
        { "key": "cta",   "type": "link",  "label": "Button" }
      ]
    },
    {
      "key": "features",
      "label": "Features",
      "repeatable": true,
      "maxItems": 12,
      "fields": [
        { "key": "icon",  "type": "icon",     "label": "Icon" },
        { "key": "title", "type": "text",     "label": "Title", "translatable": true },
        { "key": "text",  "type": "richtext", "label": "Text",  "translatable": true }
      ]
    }
  ]
}`}</DocCodeBlock>

      <DocTip>
        Fields marked <DocCode>translatable: true</DocCode> show a separate tab for each language in the content editor.
      </DocTip>
    </div>
  );
}

function SectionContent() {
  return (
    <div>
      <DocH1>Content Management</DocH1>
      <DocLead>Content created from page models is managed here.</DocLead>

      <DocH2>Creating New Content</DocH2>
      <DocStep number={1} title="Go to Content">Select <strong>Content</strong> from the left menu.</DocStep>
      <DocStep number={2} title="Choose a model">Click <DocCode>+ New Content</DocCode> and select a model.</DocStep>
      <DocStep number={3} title="Enter a slug">Enter the slug used in the URL (e.g. <DocCode>about-us</DocCode>).</DocStep>
      <DocStep number={4} title="Fill in the content">Use the language tabs for translatable fields.</DocStep>
      <DocStep number={5} title="Save or publish">You can save a draft and publish it later.</DocStep>

      <DocH2>Content Statuses</DocH2>
      <div className="flex flex-wrap gap-2 my-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm">
          <DocBadge color="gray">Draft</DocBadge>
          <span className="text-muted-foreground text-xs">Visible to editors only, not exposed by the Public API</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm">
          <DocBadge color="green">Published</DocBadge>
          <span className="text-muted-foreground text-xs">Available through the Public API</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm">
          <DocBadge color="orange">Archived</DocBadge>
          <span className="text-muted-foreground text-xs">Unpublished but not deleted</span>
        </div>
      </div>

      <DocTip>
        Use the <strong>CSV / Excel</strong> buttons on the list to export the filtered content.
      </DocTip>

      <DocH2>Page Preview</DocH2>
      <DocP>
        While editing content, a <DocCode>Preview</DocCode> button appears at the top right. Clicking it opens your page in a new tab, based on the <DocCode>Site URL</DocCode> configured under <strong>Settings → General</strong>.
      </DocP>
      <DocStep number={1} title="Set the Site URL">Enter your site's address in the <DocCode>Site URL</DocCode> field under Settings → General (e.g. <DocCode>https://www.company.com</DocCode>).</DocStep>
      <DocStep number={2} title="Open the content">Click Preview on any content edit page.</DocStep>

      <DocH2>Status Transitions</DocH2>
      <DocTable
        headers={["From", "To", "How"]}
        rows={[
          ["Draft", "Published", "Click the green ✓ icon on the list (requires the pages.publish permission)"],
          ["Published", "Archived", "Click the archive icon on the list"],
          ["Archived", "Draft", "Change the status from the edit screen"],
        ]}
      />
    </div>
  );
}

function SectionMedia() {
  return (
    <div>
      <DocH1>Media Library</DocH1>
      <DocLead>All files (images, PDFs, videos, etc.) are managed in one place.</DocLead>

      <DocH2>Uploading Files</DocH2>
      <DocStep number={1} title="Go to Media">Select <strong>Media</strong> from the left menu.</DocStep>
      <DocStep number={2} title="Upload the file">Click <DocCode>Upload File</DocCode> at the top right, or <strong>drag and drop</strong> files directly onto the page — multiple files can be uploaded at once.</DocStep>
      <DocStep number={3} title="Automatic classification">Files are filed automatically by type (image/document/video), and a thumbnail is generated for images.</DocStep>

      <DocTip>
        When you drag files onto the Media page, a blue drop zone appears. You can drop several files at once.
      </DocTip>

      <DocH2>Storage Layout</DocH2>
      <DocCodeBlock>{`wwwroot/uploads/
├── images/     → Images (JPEG, PNG, WebP, GIF, SVG)
│   └── 2026/06/{guid}-file.jpg
├── documents/  → Documents (PDF, Word, Excel)
├── videos/     → Videos (MP4, WebM)
└── other/      → Other`}</DocCodeBlock>

      <DocH2>File Limits</DocH2>
      <DocTable
        headers={["Type", "Max Size"]}
        rows={[
          ["Image", "5 MB"],
          ["Document", "20 MB"],
          ["Video", "100 MB"],
        ]}
      />

      <DocH2>Features</DocH2>
      <div className="space-y-2 my-4">
        {[
          { icon: CheckCircle, text: "Thumbnails are generated automatically for images" },
          { icon: CheckCircle, text: "Alt text (accessibility) can be entered per language" },
          { icon: CheckCircle, text: "Filter by file type to show only images, documents or videos" },
          { icon: CheckCircle, text: "Files can be picked directly from asset fields in content forms" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2.5">
            <Icon size={15} className="text-green-500 mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionRoles() {
  return (
    <div>
      <DocH1>Roles & Permissions</DocH1>
      <DocLead>A dynamic role system — administrators create their own roles from the panel, no code changes required.</DocLead>

      <DocH2>Creating a Role</DocH2>
      <DocStep number={1} title="Go to Roles & Permissions">Requires the <DocCode>roles.manage</DocCode> permission.</DocStep>
      <DocStep number={2} title="Click New Role">Enter a role name and description.</DocStep>
      <DocStep number={3} title="Fill in the permission matrix">Tick the permissions for each module.</DocStep>
      <DocStep number={4} title="Save">You can now assign this role to users.</DocStep>

      <DocH2>Permission List</DocH2>
      <DocTable
        headers={["Module", "Permissions"]}
        rows={[
          ["Pages", "view · create · edit · delete · publish"],
          ["PageModels", "view · create · edit · delete"],
          ["Media", "view · upload · delete"],
          ["Menus", "manage"],
          ["Settings", "general.edit · seo.edit · smtp.edit · localization.edit · languages.manage"],
          ["Users", "manage"],
          ["Roles", "manage"],
          ["Dashboard", "view"],
          ["Activity", "view"],
        ]}
      />

      <DocWarning>
        <strong>SuperAdmin</strong> is a system role — it cannot be deleted and its permissions cannot be changed. It automatically has every permission.
      </DocWarning>

      <DocH2>Assigning Roles to a User</DocH2>
      <DocStep number={1} title="Go to Users">Select <strong>Users</strong> from the left menu.</DocStep>
      <DocStep number={2} title="Click the Assign Roles icon">Click the 👤 icon on the user's row.</DocStep>
      <DocStep number={3} title="Select roles">Multiple roles can be selected — their permissions are combined.</DocStep>
      <DocStep number={4} title="Save">Changes take effect on the user's next sign-in.</DocStep>

      <DocInfo>
        All of the user's permission keys are embedded in the JWT as claims. Role changes take effect after the next sign-in or token refresh.
      </DocInfo>
    </div>
  );
}

function SectionSettings() {
  return (
    <div>
      <DocH1>System Settings</DocH1>
      <DocLead>Open Settings from the left menu to configure 5 different tabs.</DocLead>

      <DocTable
        headers={["Tab", "Contents"]}
        rows={[
          ["General", "Site name, logo, favicon, contact info, Site URL, subscription on/off, contact form auto-reply"],
          ["SEO", "Title template, meta description, OG image, Google Analytics / GTM ID"],
          ["SMTP", "Mail server configuration — the password is stored encrypted"],
          ["Localization", "Default content language, date format, time zone"],
          ["Theme", "Primary color and font"],
        ]}
      />

      <DocH2>General Tab — Special Fields</DocH2>
      <DocTable
        headers={["Field", "Description"]}
        rows={[
          ["Site URL", "Full address of your frontend site (e.g. https://www.company.com). The Preview button in the content editor uses this URL."],
          ["Subscription System", "When turned off, new subscriptions are blocked (503). Existing subscribers are kept."],
          ["Contact Form Auto-Reply", "When on, an automatic thank-you email is sent to whoever submits the contact form."],
        ]}
      />

      <DocH2>SMTP Password Security</DocH2>
      <DocInfo>
        The SMTP password is encrypted with AES-256 and stored in the database. It is always shown as <DocCode>••••••</DocCode> in the panel.
        Leave the field empty if you don't want to change it — the existing password is kept.
      </DocInfo>

      <DocH2>Adding a Content Language</DocH2>
      <DocInfo>
        The admin panel itself is English-only. Languages added here apply to your site content.
      </DocInfo>
      <DocStep number={1} title="Go to Settings → Languages" />
      <DocStep number={2} title="Click Add Language">Enter the language code (e.g. <DocCode>de</DocCode>), name and flag emoji.</DocStep>
      <DocStep number={3} title="Save">The new language automatically appears as a tab in content forms and menu editors.</DocStep>
    </div>
  );
}

function SectionMenus() {
  return (
    <div>
      <DocH1>Menu Management</DocH1>
      <DocLead>4 separate menus are managed independently, so desktop and mobile can have different structures.</DocLead>

      <DocTable
        headers={["Menu Key", "Used For"]}
        rows={[
          ["navbar-desktop", "Desktop top navigation"],
          ["navbar-mobile",  "Mobile hamburger menu"],
          ["footer-desktop", "Desktop footer"],
          ["footer-mobile",  "Mobile footer"],
        ]}
      />

      <DocH2>Menu Item Properties</DocH2>
      <DocTable
        headers={["Field", "Description"]}
        rows={[
          ["Label", "Separate text for each active content language"],
          ["Link Type", "page (internal slug) · external (URL) · category"],
          ["Target", "Slug or full URL"],
          ["Icon", "Lucide icon name (optional)"],
          ["New Tab", "Whether it opens as _blank"],
          ["Sub Items", "Nested hierarchy — reorder with drag & drop"],
        ]}
      />

      <DocTip>
        <strong>Expand</strong> items to edit them, and add <strong>Sub Items</strong> to build dropdown menus.
        Changes are not applied until you click <strong>Save</strong>.
      </DocTip>
    </div>
  );
}

function SectionContact() {
  return (
    <div>
      <DocH1>Contact & Mail</DocH1>
      <DocLead>
        Manage messages from your site's contact form, send mail to individuals or to all subscribers,
        and create reusable mail templates.
      </DocLead>

      <DocH2>Contact Messages</DocH2>
      <DocP>
        The <strong>Contact Messages</strong> page in the left menu shows the messages visitors sent through the contact form.
        Unread messages are shown in bold.
      </DocP>
      <DocStep number={1} title="Open a message">Click a message in the list — its content appears in the right panel and it is marked as read automatically.</DocStep>
      <DocStep number={2} title="Reply">Click <DocCode>Reply</DocCode> to send an email directly to that person.</DocStep>
      <DocStep number={3} title="Delete">Remove handled messages with the trash icon.</DocStep>

      <DocH2>Auto-Reply</DocH2>
      <DocP>
        An automatic thank-you email can be sent to visitors when they submit the contact form.
      </DocP>
      <DocStep number={1} title="Go to Settings → General" />
      <DocStep number={2} title="Turn on the Contact Form Auto-Reply toggle">The subject and HTML content fields appear.</DocStep>
      <DocStep number={3} title="Fill in subject and content">You can write the reply in HTML.</DocStep>
      <DocStep number={4} title="Save">From now on, every contact form submission gets an automatic reply.</DocStep>

      <DocWarning>
        <strong>Settings → SMTP</strong> must be configured correctly for auto-replies to be sent.
      </DocWarning>

      <DocH2>Send Mail</DocH2>
      <DocP>
        From the <strong>Send Mail</strong> page in the left menu you can email specific people or all active subscribers.
      </DocP>
      <DocTable
        headers={["Feature", "Description"]}
        rows={[
          ["Multiple recipients", "Add recipient rows to send to several people at once"],
          ["Load Template", "Pick a saved template to fill in subject and content automatically"],
          ["All Subscribers", "Sends a bulk mail to every active subscriber — asks for confirmation"],
          ["TipTap editor", "Rich text formatting such as bold, headings and lists"],
          ["Send history", "A summary of mails sent during this session is shown at the bottom of the page"],
        ]}
      />

      <DocH2>Mail Templates</DocH2>
      <DocP>
        Save subject + content combinations you use often as templates. They are managed on the <strong>Mail Templates</strong> page in the left menu.
      </DocP>
      <DocStep number={1} title="Go to Mail Templates">Select <strong>Mail Templates</strong> under the Communication group in the left menu.</DocStep>
      <DocStep number={2} title="Create a new template">Enter a name, subject and HTML content.</DocStep>
      <DocStep number={3} title="Use it on the Send Mail page">Click <DocCode>Load Template</DocCode> and pick the template — subject and content are filled in automatically.</DocStep>
    </div>
  );
}

function SectionSubscribers() {
  return (
    <div>
      <DocH1>Subscribers</DocH1>
      <DocLead>
        People who fill in your site's subscription form are listed here.
        The subscription system can be turned on or off.
      </DocLead>

      <DocH2>Subscription System Setting</DocH2>
      <DocStep number={1} title="Go to Settings → General" />
      <DocStep number={2} title="Turn the Subscription System toggle on or off">
        While off, the <DocCode>POST /api/public/subscribe</DocCode> endpoint returns <DocCode>503</DocCode>
        and no new subscriptions can be created.
      </DocStep>

      <DocTip>
        Turning subscriptions off does not delete existing subscribers; it only blocks new sign-ups.
      </DocTip>

      <DocH2>Subscriber List</DocH2>
      <DocP>
        Go to <strong>Subscribers</strong> in the left menu. Use the Active / Cancelled / All filters to narrow the list.
      </DocP>
      <DocTable
        headers={["Column", "Description"]}
        rows={[
          ["Email", "The subscriber's email address"],
          ["Name", "Optional — if a name was entered in the form"],
          ["Status", "Active (green) / Cancelled (gray)"],
          ["Subscribed At", "When the subscription was created"],
        ]}
      />

      <DocH2>Bulk Mail</DocH2>
      <DocP>
        The <DocCode>All Subscribers</DocCode> button on the <strong>Send Mail</strong> page
        sends the same mail to every subscriber whose status is <em>Active</em>.
        A confirmation dialog is shown before sending starts.
      </DocP>

      <DocH2>Unsubscribing</DocH2>
      <DocP>
        Visitors can cancel their subscription by calling the <DocCode>POST /api/public/unsubscribe</DocCode> endpoint.
        You can also delete a subscriber from the panel.
      </DocP>

      <DocH2>Public API Endpoints</DocH2>
      <DocCodeBlock>{`POST /api/public/subscribe
Body: { "email": "...", "fullName": "..." }
→ Creates a subscription (returns 503 if the system is off)

POST /api/public/unsubscribe
Body: { "email": "..." }
→ Cancels the subscription`}</DocCodeBlock>
    </div>
  );
}

function SectionApi() {
  return (
    <div>
      <DocH1>Public API</DocH1>
      <DocLead>Your frontend consumes CMS content through these endpoints. No authentication required; responses are cached for 5 minutes.</DocLead>

      <DocH2>Endpoints</DocH2>
      <DocCodeBlock>{`GET /api/public/pages/{modelKey}/{slug}?lang=en
    → Single page content (each request increments ViewCount)

GET /api/public/pages/{modelKey}?lang=en&page=1&pageSize=10
    → List of published pages (blog index, etc.)

GET /api/public/menus/{key}?lang=en
    → Menu tree (navbar-desktop, footer-mobile, etc.)

GET /api/public/settings?lang=en
    → General settings, SEO defaults, social links, theme

GET /api/public/languages
    → List of active content languages`}</DocCodeBlock>

      <DocH2>Example Request & Response</DocH2>
      <DocCodeBlock>{`// Request
fetch("/api/public/pages/blog-post/what-is-ai?lang=en")

// Response
{
  "id": "3fa85f64-...",
  "modelKey": "blog-post",
  "slug": "what-is-ai",
  "contentJson": {
    "en": {
      "hero": { "title": "What Is AI?", "image": { "url": "/uploads/..." } }
    }
  },
  "seoMetaJson": {
    "en": { "title": "What Is AI? | Blog", "description": "..." }
  },
  "viewCount": 142,
  "publishedAt": "2026-06-13T10:00:00Z"
}`}</DocCodeBlock>

      <DocInfo>
        Public endpoints use a <strong>5-minute output cache</strong>. Newly published content becomes visible
        within 5 minutes at most.
      </DocInfo>

      <DocH2>Admin API</DocH2>
      <DocTable
        headers={["Prefix", "Authentication", "Description"]}
        rows={[
          ["/api/admin/*", "JWT Bearer token required", "Panel operations (CRUD, upload, settings)"],
          ["/api/public/*", "Not required", "Read-only, for frontend consumption"],
          ["/api/auth/*", "Not required", "Login, refresh token, logout"],
        ]}
      />
    </div>
  );
}

const CONTENT_MAP = {
  "overview":    <SectionOverview />,
  "page-models": <SectionPageModels />,
  "content":     <SectionContent />,
  "media":       <SectionMedia />,
  "roles":       <SectionRoles />,
  "settings":    <SectionSettings />,
  "menus":       <SectionMenus />,
  "contact":     <SectionContact />,
  "subscribers": <SectionSubscribers />,
  "api":         <SectionApi />,
};

/* ─── Main page ─── */
export default function DocsPage() {
  const [active, setActive] = useState("overview");

  return (
    <>
      <PanelHelmet title="Documentation" />

      <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
        {/* Sidebar nav */}
        <nav className="w-56 shrink-0">
          <div className="sticky top-0 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
              Topics
            </p>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-sm transition-all",
                  active === id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon size={15} className={active === id ? "text-primary" : "opacity-60"} />
                {label}
                {active === id && <ChevronRight size={12} className="ml-auto text-primary/60" />}
              </button>
            ))}
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0 rounded-2xl border bg-card p-8">
          {CONTENT_MAP[active]}
        </div>
      </div>
    </>
  );
}
