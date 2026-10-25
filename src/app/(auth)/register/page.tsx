"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpUser } from "@/lib/authAction";
import { getAuthenticatedDestination } from "@/lib/authRedirect";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RegisterPage() {
  const [role, setRole] = useState<"USER" | "VENDOR">("USER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, role: signedInRole, loading: authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading && user && !isSubmitting) {
      router.replace(getAuthenticatedDestination(signedInRole));
    }
  }, [authLoading, user, signedInRole, isSubmitting, router]);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password || !fullName) return alert("Please fill all fields");

    setLoading(true);
    setIsSubmitting(true);
    let redirecting = false;
    try {
      const { user: createdUser, error } = await signUpUser(email, password, fullName, role);
      if (error) {
        alert(error);
        return;
      }
      if (!createdUser) return;

      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `session-token=${createdUser.uid}; path=/; max-age=86400; SameSite=Lax${secure}`;
      document.cookie = `user-role=${role}; path=/; max-age=86400; SameSite=Lax${secure}`;
      redirecting = true;
      router.replace(getAuthenticatedDestination(role));
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Something went wrong while creating your account.");
    } finally {
      setLoading(false);
      if (!redirecting) setIsSubmitting(false);
    }
  };

  if (authLoading || (user && !isSubmitting)) {
    return (
      <main className="route-loader" aria-label="Checking your account">
        <span className="route-loader-mark">QUTUB<span>.</span></span>
        <span className="route-loader-line"><i /></span>
        <p>CHECKING YOUR ACCOUNT</p>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand">QUTUB<span>.</span></Link>
      <div className="auth-layout">
        <section className="auth-story">
          <span className="auth-kicker">A considered marketplace</span>
          <h1>Find your<br /><em>own good.</em></h1>
          <p>Join a community that brings independent makers and thoughtful finds a little closer.</p>
          <span className="auth-story-foot">Small shops. Standout finds.</span>
        </section>
        <section className="auth-form-panel">
          <span className="auth-kicker">Start here</span>
          <h2>Create your account</h2>
          <p className="auth-lede">A few details and you are part of the collection.</p>
          <Tabs defaultValue="USER" onValueChange={(value) => setRole(value as "USER" | "VENDOR")} className="auth-role-tabs">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="USER">Customer</TabsTrigger>
              <TabsTrigger value="VENDOR">Vendor</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleRegister} className="auth-form">
            <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" autoComplete="name" required /></label>
            <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" autoComplete="new-password" required /></label>
            <Button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Creating account..." : `Join as ${role === "USER" ? "customer" : "vendor"}`}
            </Button>
          </form>
          <p className="auth-switch">Already have an account? <Link href="/login">Sign in <span>↗</span></Link></p>
          <Link href="/" className="auth-back">Back to the collection</Link>
        </section>
      </div>
    </main>
  );
}
