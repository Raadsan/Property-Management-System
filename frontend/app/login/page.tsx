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
import { Checkbox } from "@/components/ui/checkbox"
import { EyeIcon, EyeOffIcon, Loader2Icon, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { loginUser as performLogin } from "@/api/userApi"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errorStatus, setErrorStatus] = React.useState<string | null>(null)
  const [successStatus, setSuccessStatus] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorStatus(null)
    setSuccessStatus(null)

    try {
      const response = await performLogin(email, password)
      
      sessionStorage.setItem("user", JSON.stringify(response.user))
      setSuccessStatus(response.message || "Signed in successfully")
      setTimeout(() => router.push("/dashboard"), 800)
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Invalid email or password"
      setErrorStatus(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="light min-h-screen flex items-center justify-center bg-[#f8fafc] p-4" style={{ colorScheme: 'light' }}>
      <Card className="w-full max-w-[440px] border-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl bg-white !text-gray-900 overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-12 pb-6">
          <div className="flex justify-center">
            <div className="bg-[#214347] p-3.5 rounded-2xl shadow-lg -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-[#1e293b] tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-[15px] text-gray-400 font-medium">
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-10 pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorStatus && (
              <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-[13px] font-semibold text-red-600">{errorStatus}</p>
              </div>
            )}
            {successStatus && (
              <div className="flex items-start gap-3 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-[13px] font-semibold text-emerald-700">{successStatus}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1e293b] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#214347] transition-colors">
                  <Mail size={18} />
                </div>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-13 pl-12 rounded-xl border-gray-200 bg-gray-50/50 !text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#214347] focus-visible:ring-0 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[13px] font-bold text-[#1e293b]">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#214347] transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-13 pl-12 pr-12 rounded-xl border-gray-200 bg-gray-50/50 !text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#214347] focus-visible:ring-0 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#214347] transition-colors"
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
              <Link href="/forgot-password" className="text-sm font-semibold text-[#214347] hover:underline whitespace-nowrap">
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
            <Link href="/signup" className="text-[#214347] font-bold hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
