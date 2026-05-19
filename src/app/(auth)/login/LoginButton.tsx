// LoginButton.tsx ya usi file ke niche
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const { pending } = useFormStatus(); // Ye check karega ke form submit ho raha hai ya nahi

  return (
    <Button 
      type="submit" 
      className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
      disabled={pending}
    >
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}