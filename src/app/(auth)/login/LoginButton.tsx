// LoginButton.tsx ya usi file ke niche
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const { pending } = useFormStatus(); // Ye check karega ke form submit ho raha hai ya nahi

  return (
    <Button 
      type="submit" 
      className="auth-submit" 
      disabled={pending}
    >
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}
