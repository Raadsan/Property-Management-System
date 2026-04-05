"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { loginUser as performLogin } from "@/api/userApi"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await performLogin(email, password)
      
      // Store user info in local storage (basic persistence)
      localStorage.setItem("user", JSON.stringify(response.user))
      
      toast.success(response.message || "Signed in successfully")
      
      // Navigate to dashboard
      router.push("/dashboard")
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Authentication failed. Please check your network."
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="light min-h-screen flex items-center justify-center bg-white p-4" style={{ colorScheme: 'light' }}>
      <Card className="w-full max-w-[400px] border border-gray-200 shadow-sm rounded-2xl bg-white !text-gray-900">
        <CardHeader className="space-y-1 text-center pt-10 pb-8">
          <CardTitle className="text-[28px] font-bold text-[#1e293b]">
            Sign In
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-lg border-gray-300 !bg-white !text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#214347]"
              />
            </div>
            <div className="space-y-2 relative">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-lg border-gray-300 !bg-white !text-gray-900 placeholder:text-gray-400 pr-10 focus-visible:ring-[#214347]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="rounded border-gray-300 data-[state=checked]:bg-[#214347] data-[state=checked]:border-[#214347]" />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-500 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <Link href="#" className="text-sm font-semibold text-[#214347] hover:underline whitespace-nowrap">
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-[#214347] hover:bg-[#1a3539] text-white rounded-lg font-bold text-base transition-colors shadow-sm"
            >
              {isLoading ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-white" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-100 py-6 !bg-white">
          <p className="text-sm text-gray-500 font-medium">
            Don't have an account?{" "}
            <Link href="#" className="text-[#214347] font-bold hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
