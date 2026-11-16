# NEXUS CMS — Admin Panel

React admin panel for the NEXUS CMS headless content management system.

## Tech Stack

- **React 19** — Create React App, JSX
- **Redux Toolkit** + RTK Query
- **TailwindCSS** + shadcn/ui
- **TipTap** — rich text editor
- **dnd-kit** — drag & drop
- **TanStack Table** — server-side data tables
- **Lucide Icons** · **sonner** (toasts)

## Getting Started

### Prerequisites

- Node.js 18+
- NEXUS CMS API running → [cms-api](https://github.com/hasamuddinafz/cms-api)

### Install

```bash
npm install
```

### Environment

Create `.env` in the project root:

```env
REACT_APP_API_URL=http://localhost:5281
```

Set this to your production API URL before building.

### Run (development)

```bash
npm start
# http://localhost:3000
```

### Build (production)

```bash
npm run build
```

## Features

| Module | Description |
|---|---|
| Dashboard | Stats, top pages, recent activity chart |
| Page Models | Drag & drop schema builder (sections + fields) |
| Content | Multi-language content editor, draft/publish workflow |
| Media Library | Upload, thumbnails, search, pagination |
| Menus | Navbar / Footer editor — desktop & mobile variants |
| Languages | Manage active languages and default |
| Settings | General, SEO, SMTP, Localization, Theme |
| Users | User management with dynamic role assignment |
| Roles & Permissions | Granular permission matrix per module/action |
| Activity Log | Full audit trail with CSV/Excel export |
| Mail | Send individual or bulk mail via SMTP |
| Mail Templates | Reusable email templates |
| Subscribers | Newsletter subscriber list |
| Contact Messages | Contact form inbox with auto-reply support |

## Multi-language Content

The panel UI is English-only; site **content** can be written in any number of languages managed under *Settings → Languages*.

Fields marked **translatable** in the schema store content per language. Non-translatable fields show an amber **"shared"** badge and share one value across all languages.

## Project Structure

```
src/
├── app/              # Redux store, typed hooks
├── components/
│   ├── data-table/   # Generic server-side table (search, sort, paginate, export)
│   ├── form-builder/ # Dynamic field renderer (text, richtext, asset, repeater…)
│   ├── layout/       # Sidebar, Header, PanelHelmet
│   └── ui/           # shadcn/ui primitives, ConfirmDialog
├── features/         # RTK Query API slices per domain
└── pages/            # Route-level page components
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:5000` (fallback) | NEXUS CMS API base URL |

## Default Login

After the first start the API seeds a SuperAdmin user: `admin@nexuscms.local` / `Admin1234!`. **Change this password immediately.**

## Contributing

NEXUS CMS is open source and contributions are welcome. Fork the repo, create a feature branch, make sure the build passes, and open a Pull Request describing what changed and why. Bug reports and feature ideas are welcome as issues.

Related repository — API: [cms-api](https://github.com/hasamuddinafz/cms-api)

## License

[MIT](LICENSE) © Hasamuddin Afzali
