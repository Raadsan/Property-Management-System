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
import { EyeIcon, EyeOffIcon, Loader2Icon, Mail, Lock, User, Phone, CheckCircle2, AlertCircle } from "lucide-react"
import { createUser } from "@/api/userApi"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errorStatus, setErrorStatus] = React.useState<string | null>(null)
  const [successStatus, setSuccessStatus] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorStatus(null)
    setSuccessStatus(null)

    try {
      await createUser({
        name,
        email,
        phone,
        password,
        roleId: 3,
        status: "ACTIVE"
      })

      setSuccessStatus("Account created successfully. Redirecting to sign in...")
      setTimeout(() => router.push("/login"), 1200)

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to create account. Please try again."
      setErrorStatus(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="light min-h-screen flex items-center justify-center bg-[#f8fafc] p-4" style={{ colorScheme: 'light' }}>
      <Card className="w-full max-w-[480px] border-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl bg-white !text-gray-900 overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-8 pb-2">
          <div className="flex justify-center">
            <div className="bg-[#214347] p-3 rounded-2xl shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-2xl font-black text-[#1e293b] tracking-tight">
              Create Account
            </CardTitle>
            <CardDescription className="text-[14px] text-gray-400 font-medium">
              Join Somalia's leading real estate platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#1e293b] ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#214347] transition-colors">
                  <User size={18} />
                </div>
                <Input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 pl-12 rounded-xl border-gray-100 bg-gray-50/50 !text-gray-900 focus:bg-white focus:border-[#214347] focus-visible:ring-0 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#1e293b] ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#214347] transition-colors">
                    <Mail size={16} />
                  </div>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-11 rounded-xl border-gray-100 bg-gray-50/50 !text-gray-900 focus:bg-white focus:border-[#214347] focus-visible:ring-0 transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#1e293b] ml-1">Phone Number</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#214347] transition-colors">
                    <Phone size={16} />
                  </div>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-12 pl-11 rounded-xl border-gray-100 bg-gray-50/50 !text-gray-900 focus:bg-white focus:border-[#214347] focus-visible:ring-0 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#1e293b] ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#214347] transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-12 pr-12 rounded-xl border-gray-100 bg-gray-50/50 !text-gray-900 focus:bg-white focus:border-[#214347] focus-visible:ring-0 transition-all text-sm font-medium"
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#214347] hover:bg-[#1a3539] text-white rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-[#214347]/20 mt-2"
            >
              {isLoading ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-white" />
              ) : (
                "Create Account"
              )}
            </Button>

          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-center border-t border-gray-100 py-6 bg-gray-50/30">
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-[#214347] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

