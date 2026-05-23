import { createBrowserRouter, redirect } from "react-router-dom";

import RootLayout from "@/pages/RootLayout";
import HomePage from "@/pages/api/Home";
import ErrorPage from "@/pages/Error";

import LoginPage from "@/pages/auth/Login";
import SignUpPage from "@/pages/auth/SignUp";
import ResetPasswordPage from "@/pages/auth/ResetPassword";
import NewPasswordPage from "@/pages/auth/NewPassword";

import {
  loginAction,
  registerAction,
  resetAction,
  newPasswordAction,
  logoutAction,
} from "@/router/action";
import DraftPage from "./pages/api/DraftPage";
import CurrentWorkPage from "./pages/api/CurrentWorkPage";
import ExportedNotesPage from "./pages/api/ExportedNotesPage";
import About from "./pages/api/About";
import ProfilePage from "./pages/profile/ProfilePage";
import CanvaRootLayout from "./pages/CanvaRootLayout";
import {
  currentWorkLoader,
  draftsLoader,
  exportedNotesLoader,
  loginLoader,
  protectedLoader,
} from "./router/loader";
import { Suspense } from "react";

const SuspenseFallback = () => <div className="text-center">Loading...</div>;
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    loader: protectedLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/drafts",
        element: <DraftPage />,
        loader: draftsLoader,
      },
      {
        path: "/current-work",
        element: <CurrentWorkPage />,
        loader: currentWorkLoader,
      },
      {
        path: "/exported-notes",
        element: <ExportedNotesPage />,
        loader: exportedNotesLoader,
      },
      {
        path: "/aboutus",
        element: <About />,
      },
    ],
  },

  {
    path: "/login",
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <LoginPage />
      </Suspense>
    ),
    action: loginAction,
    loader: loginLoader,
  },

  {
    path: "/register",
    element: <SignUpPage />,
    action: registerAction,
    loader: loginLoader,
  },

  {
    path: "/reset",
    element: <ResetPasswordPage />,
    action: resetAction,
  },

  {
    path: "/reset-password/:token",
    element: <NewPasswordPage />,
    action: newPasswordAction,
  },

  {
    path: "/logout",
    action: logoutAction,
    loader: () => redirect("/"),
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/canva",
    element: <CanvaRootLayout />,
  },
]);
