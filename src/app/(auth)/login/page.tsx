"use client";
import { loginUser } from "@/lib/authAction";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginButton } from "./LoginButton";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return alert("Please enter email and password");
    }

    try {
      const { user, role, error } = await loginUser(email, password);

      if (error) {
        alert(error);
      } else if (user && role) {
        // 🔹 FIX: Server Middleware ke liye Browser me Cookies set karein
        // Real-world me session token secure hona chahiye, abhi ke liye UID use kar rahe hain
        document.cookie = `session-token=${user.uid}; path=/; max-age=86400; SameSite=Lax; Secure`;
        document.cookie = `user-role=${role}; path=/; max-age=86400; SameSite=Lax; Secure`;

        // 🔹 Ab router navigation perfect chalegi aur middleware block nahi karega
        if (role === "VENDOR") {
          router.push("/vendor-dashboard");
        } else if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "USER") {
          router.push("/user-dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Something went wrong during login.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      <form action={handleLogin}>
        <Card className="w-87.5 shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input type="email" name="email" placeholder="Email" required />
            </div>
            <div className="space-y-2">
              <Input type="password" name="password" placeholder="Password" required />
            </div>
            <LoginButton />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}