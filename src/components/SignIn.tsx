"use client";

import { signIn } from "next-auth/react";
import PeacockFeatherIcon from "./icons/PeacockFeatherIcon";

export default function SignIn() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-xs w-full p-6 flex flex-col items-center text-center">
        <PeacockFeatherIcon size={48} className="mb-6" />
        <h2 className="text-xl font-bold mb-2">Sign in to Inkwell</h2>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Your entries, synced securely to your account.
        </p>

        <button
          onClick={() => signIn("google")}
          className="btn btn-secondary w-full flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.58v2.98h3.93c2.3-2.12 3.62-5.24 3.62-8.8z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.93-2.98c-1.08.74-2.47 1.18-4 1.18-3.08 0-5.69-2.08-6.62-4.87H1.32v3.07C3.29 21.3 7.31 24 12 24z" />
            <path fill="#FBBC05" d="M5.38 14.41c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.78H1.32C.48 8.43 0 10.16 0 12s.48 3.57 1.32 5.22l4.06-3.16v-.65z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.29 2.7 1.32 6.78l4.06 3.15c.93-2.79 3.54-4.87 6.62-4.87z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
