import React from "react";
import { Mail, Code } from "lucide-react";
import { AuthButton } from "@/components/general/buttons/auth-button";

export function OAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <AuthButton icon={<Code size={18} />} text="GitHub" />
      <AuthButton icon={<Mail size={18} className="text-red-500" />} text="Google" />
    </div>
  );
}
