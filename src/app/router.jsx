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
          { path: "page-models",           element: <PageModelsPage />,      handle: { title: "Page Models" } },
          { path: "page-models/new",       element: <PageModelEditorPage />, handle: { title: "New Model" } },
          { path: "page-models/edit/:id",  element: <PageModelEditorPage />, handle: { title: "Edit Model" } },
          { path: "pages",          element: <PagesPage />,       handle: { title: "Content" } },
          { path: "pages/new",     element: <PageEditorPage />,  handle: { title: "New Content" } },
          { path: "pages/edit/:id",element: <PageEditorPage />,  handle: { title: "Edit Content" } },
          { path: "media",        element: <MediaPage />,      handle: { title: "Media" } },
          { path: "menus",        element: <MenusPage />,      handle: { title: "Menus" } },
          { path: "settings",     element: <SettingsPage />,   handle: { title: "Settings" } },
          {
            path: "settings/languages",
            element: <LanguagesPage />,
            handle: { title: "Languages" },
          },

          // Permission-guarded routes
          {
            element: <RequirePermission permission="users.manage" />,
            children: [
              { path: "users", element: <UsersPage />, handle: { title: "Users" } },
            ],
          },
          {
            element: <RequirePermission permission="roles.manage" />,
            children: [
              { path: "roles", element: <RolesPage />, handle: { title: "Roles & Permissions" } },
            ],
          },
          {
            element: <RequirePermission permission="activity.view" />,
            children: [
              { path: "activity", element: <ActivityPage />, handle: { title: "Activity" } },
            ],
          },

          { path: "docs", element: <DocsPage />, handle: { title: "Documentation" } },

          // Contact & Mail
          {
            element: <RequirePermission permission="contact.view" />,
            children: [
              { path: "contact", element: <ContactPage />, handle: { title: "Contact Messages" } },
            ],
          },
          {
            element: <RequirePermission permission="mail.send" />,
            children: [
              { path: "mail", element: <MailComposePage />, handle: { title: "Send Mail" } },
              { path: "mail/templates", element: <MailTemplatesPage />, handle: { title: "Mail Templates" } },
            ],
          },
          {
            element: <RequirePermission permission="subscribers.view" />,
            children: [
              { path: "subscribers", element: <SubscribersPage />, handle: { title: "Subscribers" } },
            ],
          },

          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
