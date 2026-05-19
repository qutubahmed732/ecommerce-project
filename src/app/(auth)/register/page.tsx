"use client"
import { useState } from "react"
import { signUpUser } from "@/lib/authAction" // Check spelling (authAction ya auth-actions)
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RegisterPage() {
  const [role, setRole] = useState<"USER" | "VENDOR">("USER")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    if (!email || !password || !fullName) return alert("Please fill all fields");
    
    setLoading(true)
    const { user, error } = await signUpUser(email, password, fullName, role);
    setLoading(false)

    if (error) {
      alert(error)
    } else {
      alert("Account created successfully!")
      router.push("/login")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <Card className="w-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="USER" onValueChange={(v) => setRole(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="USER">Customer</TabsTrigger>
              <TabsTrigger value="VENDOR">Vendor</TabsTrigger>
              {/* <TabsTrigger value="ADMIN">Admin</TabsTrigger> */}
            </TabsList>
          </Tabs>
          
          <div className="space-y-4">
            <Input 
              placeholder="Full Name" 
              onChange={(e) => setFullName(e.target.value)} 
            />
            <Input 
              type="email" 
              placeholder="Email" 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <Button 
              className="w-full" 
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Creating Account..." : `Register as ${role === "USER" ? "Customer" : "Vendor"}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}