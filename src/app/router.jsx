import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import RequireAuth from "../components/layout/RequireAuth";
import RequirePermission from "../components/layout/RequirePermission";

import LoginPage       from "../pages/LoginPage";
import DashboardPage   from "../pages/DashboardPage";
import PageModelsPage       from "../pages/PageModelsPage";
import PageModelEditorPage  from "../pages/PageModelEditorPage";
import PagesPage       from "../pages/PagesPage";
import PageEditorPage  from "../pages/PageEditorPage";
import MediaPage       from "../pages/MediaPage";
import MenusPage       from "../pages/MenusPage";
import SettingsPage    from "../pages/SettingsPage";
import LanguagesPage   from "../pages/LanguagesPage";
import UsersPage       from "../pages/UsersPage";
import RolesPage       from "../pages/RolesPage";
import ActivityPage    from "../pages/ActivityPage";
import DocsPage           from "../pages/DocsPage";
import ContactPage        from "../pages/ContactPage";
import MailComposePage    from "../pages/MailComposePage";
import MailTemplatesPage  from "../pages/MailTemplatesPage";
import SubscribersPage    from "../pages/SubscribersPage";
import NotFoundPage       from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true,          element: <DashboardPage />,  handle: { title: "Dashboard" } },
          { path: "page-models",           element: <PageModelsPage />,      handle: { title: "Sayfa Modelleri" } },
          { path: "page-models/new",       element: <PageModelEditorPage />, handle: { title: "Yeni Model" } },
          { path: "page-models/edit/:id",  element: <PageModelEditorPage />, handle: { title: "Model Düzenle" } },
          { path: "pages",          element: <PagesPage />,       handle: { title: "İçerik" } },
          { path: "pages/new",     element: <PageEditorPage />,  handle: { title: "Yeni İçerik" } },
          { path: "pages/edit/:id",element: <PageEditorPage />,  handle: { title: "İçerik Düzenle" } },
          { path: "media",        element: <MediaPage />,      handle: { title: "Medya" } },
          { path: "menus",        element: <MenusPage />,      handle: { title: "Menüler" } },
          { path: "settings",     element: <SettingsPage />,   handle: { title: "Ayarlar" } },
          {
            path: "settings/languages",
            element: <LanguagesPage />,
            handle: { title: "Diller" },
          },

          // Permission-guarded routes
          {
            element: <RequirePermission permission="users.manage" />,
            children: [
              { path: "users", element: <UsersPage />, handle: { title: "Kullanıcılar" } },
            ],
          },
          {
            element: <RequirePermission permission="roles.manage" />,
            children: [
              { path: "roles", element: <RolesPage />, handle: { title: "Roller & Yetkiler" } },
            ],
          },
          {
            element: <RequirePermission permission="activity.view" />,
            children: [
              { path: "activity", element: <ActivityPage />, handle: { title: "Aktivite" } },
            ],
          },

          { path: "docs", element: <DocsPage />, handle: { title: "Dokümantasyon" } },

          // Contact & Mail
          {
            element: <RequirePermission permission="contact.view" />,
            children: [
              { path: "contact", element: <ContactPage />, handle: { title: "İletişim Mesajları" } },
            ],
          },
          {
            element: <RequirePermission permission="mail.send" />,
            children: [
              { path: "mail", element: <MailComposePage />, handle: { title: "Mail Gönder" } },
              { path: "mail/templates", element: <MailTemplatesPage />, handle: { title: "Mail Şablonları" } },
            ],
          },
          {
            element: <RequirePermission permission="subscribers.view" />,
            children: [
              { path: "subscribers", element: <SubscribersPage />, handle: { title: "Aboneler" } },
            ],
          },

          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
