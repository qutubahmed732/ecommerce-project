"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/authAction";
import { LoginButton } from "./LoginButton";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) return alert("Please enter email and password");

    try {
      const { user, role, error } = await loginUser(email, password);
      if (error) alert(error);
      else if (user && role) {
        document.cookie = `session-token=${user.uid}; path=/; max-age=86400; SameSite=Lax; Secure`;
        document.cookie = `user-role=${role}; path=/; max-age=86400; SameSite=Lax; Secure`;
        if (role === "VENDOR") router.push("/vendor-dashboard");
        else if (role === "ADMIN") router.push("/admin");
        else if (role === "USER") router.push("/user-dashboard");
        else router.push("/");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Something went wrong during login.");
    }
  };

  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand">QUTUB<span>.</span></Link>
      <div className="auth-layout">
        <section className="auth-story">
          <span className="auth-kicker">A considered marketplace</span>
          <h1>Good things<br /><em>start here.</em></h1>
          <p>Thoughtful finds from independent makers and trusted shops. A little more meaning in every order.</p>
          <span className="auth-story-foot">Small shops. Standout finds.</span>
        </section>
        <section className="auth-form-panel">
          <span className="auth-kicker">Your account</span>
          <h2>Welcome back</h2>
          <p className="auth-lede">Sign in to pick up where you left off.</p>
          <form action={handleLogin} className="auth-form">
            <label>Email address<input type="email" name="email" placeholder="you@example.com" autoComplete="email" required /></label>
            <label>Password<input type="password" name="password" placeholder="Enter your password" autoComplete="current-password" required /></label>
            <LoginButton />
          </form>
          <p className="auth-switch">New to Qutub? <Link href="/register">Create an account <span>↗</span></Link></p>
          <Link href="/" className="auth-back">Back to the collection</Link>
        </section>
      </div>
    </main>
  );
}
