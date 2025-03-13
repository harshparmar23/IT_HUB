import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css"; // Ensure Tailwind is imported

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk publishable key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    afterSignInUrl="/" // Redirect to Dashboard after sign-in
    afterSignUpUrl="/" // Redirect to Dashboard after sign-up
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ClerkProvider>
);
