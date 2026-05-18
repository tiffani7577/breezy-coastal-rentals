import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Waves, Loader2 } from "lucide-react";

export default function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const adminLogin = trpc.auth.adminLogin.useMutation({
    onSuccess: () => onSuccess(),
    onError: (e) => setError(e.message || "Invalid email or password"),
  });
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
              onKeyDown={e => e.key === "Enter" && adminLogin.mutate({ email, password })}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <Button
            className="w-full h-12 rounded-xl font-bold text-white"
            style={{ background: "#0284c7", border: "none", fontSize: "16px" }}
            onClick={() => adminLogin.mutate({ email, password })}
            disabled={adminLogin.isPending || !email || !password}
          >
            {adminLogin.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </Button>
        </div>
      </div>
    </div>
  );
}
