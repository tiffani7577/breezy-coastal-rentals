import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Waves, Loader2 } from "lucide-react";
import { TRPCClientError } from "@trpc/client";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();
  const adminLogin = trpc.auth.adminLogin.useMutation();

  const handleSubmit = async () => {
    if (!email || !password || isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await adminLogin.mutateAsync({ email, password });
      const me = await utils.auth.me.fetch();
      if (!me || me.role !== "admin") {
        setError(
          "Sign-in worked but your session did not start. Please allow cookies for this site and try again."
        );
        return;
      }
      // Only update session after cookie + auth.me are confirmed (avoids dashboard flash)
      utils.auth.me.setData(undefined, me);
    } catch (err) {
      const message =
        err instanceof TRPCClientError
          ? err.message
          : "Invalid email or password. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#f0f9ff" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: "#0284c7" }}>
            <Waves className="w-10 h-10 text-white" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>Breezy Admin</h1>
          <p className="text-gray-500" style={{ fontSize: "15px" }}>Sign in to manage your bookings</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="mb-4">
            <Label className="text-gray-700 font-semibold mb-2 block">Email</Label>
            <Input
              type="email"
              placeholder="booking@breezycoastalrentals.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              className="h-12 rounded-xl"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-6">
            <Label className="text-gray-700 font-semibold mb-2 block">Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              className="h-12 rounded-xl"
              autoComplete="current-password"
              disabled={isSubmitting}
              onKeyDown={e => e.key === "Enter" && void handleSubmit()}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <Button
            className="w-full h-12 rounded-xl font-bold text-white"
            style={{ background: "#0284c7", border: "none", fontSize: "16px" }}
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </Button>
        </div>
      </div>
    </div>
  );
}
