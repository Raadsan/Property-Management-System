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
import {
  Loader2Icon,
  Mail,
  KeyRound,
  Lock,
  EyeIcon,
  EyeOffIcon,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react"
import { forgotPassword, verifyResetCode, resetPassword } from "@/api/userApi"

type Step = "email" | "verify" | "reset" | "success"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("email")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)

  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [errorStatus, setErrorStatus] = React.useState<string | null>(null)
  const [successStatus, setSuccessStatus] = React.useState<string | null>(null)

  // Countdown timer for resend
  const [countdown, setCountdown] = React.useState(0)

  React.useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // --- Step 1: Send Code ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorStatus(null)
    setSuccessStatus(null)

    try {
      await forgotPassword(email)
      setSuccessStatus("Reset code sent! Check your email inbox.")
      setStep("verify")
      setCountdown(60)
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to send reset code"
      setErrorStatus(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // --- Step 2: Verify Code ---
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorStatus(null)
    setSuccessStatus(null)

    try {
      await verifyResetCode(email, code)
      setSuccessStatus("Code verified! Set your new password.")
      setStep("reset")
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Invalid or expired code"
      setErrorStatus(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // --- Step 3: Reset Password ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorStatus(null)
    setSuccessStatus(null)

    if (newPassword.length < 6) {
      setErrorStatus("Password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorStatus("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await resetPassword(email, code, newPassword)
      setStep("success")
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to reset password"
      setErrorStatus(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code
  const handleResendCode = async () => {
    if (countdown > 0) return
    setIsLoading(true)
    setErrorStatus(null)
    setSuccessStatus(null)
    try {
      await forgotPassword(email)
      setSuccessStatus("New code sent to your email")
      setCountdown(60)
      setCode("")
    } catch (error: any) {
      setErrorStatus("Failed to resend code")
    } finally {
      setIsLoading(false)
    }
  }

  // Progress bar steps
  const stepIndex = step === "email" ? 0 : step === "verify" ? 1 : step === "reset" ? 2 : 3

  const stepConfig = {
    email: {
      icon: <Mail className="w-8 h-8 text-white" />,
      title: "Forgot Password?",
      description: "Enter your email to receive a reset code",
    },
    verify: {
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      title: "Verify Code",
      description: `We sent a 6-digit code to ${email}`,
    },
    reset: {
      icon: <Lock className="w-8 h-8 text-white" />,
      title: "New Password",
      description: "Choose a strong password for your account",
    },
    success: {
      icon: <CheckCircle2 className="w-8 h-8 text-white" />,
      title: "All Done!",
      description: "Your password has been reset successfully",
    },
  }

  const current = stepConfig[step]

  return (
    <div
      className="light min-h-screen flex items-center justify-center bg-[#f8fafc] p-4"
      style={{ colorScheme: "light" }}
    >
      <Card className="w-full max-w-[440px] border-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl bg-white !text-gray-900 overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-10 pb-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                    i <= stepIndex
                      ? "bg-[#214347] scale-110"
                      : "bg-gray-200"
                  }`}
                />
                {i < 2 && (
                  <div
                    className={`w-8 h-0.5 rounded-full transition-all duration-500 ${
                      i < stepIndex ? "bg-[#214347]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-[#214347] p-3.5 rounded-2xl shadow-lg -rotate-3 hover:rotate-0 transition-transform duration-300">
              {current.icon}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-[#1e293b] tracking-tight">
              {current.title}
            </CardTitle>
            <CardDescription className="text-[14px] text-gray-400 font-medium px-4">
              {current.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-10 pt-2">
          {/* Error Banner */}
          {errorStatus && (
            <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 p-4 mb-2 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-[13px] font-semibold text-red-600">{errorStatus}</p>
            </div>
          )}
          {/* Success Banner */}
          {successStatus && (
            <div className="flex items-start gap-3 bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-2 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-[13px] font-semibold text-emerald-700">{successStatus}</p>
            </div>
          )}

          {/* ===== STEP 1: Email ===== */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1e293b] ml-1">
                  Email Address
                </label>
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#214347] hover:bg-[#1a3539] text-white rounded-lg font-bold text-base transition-colors shadow-sm"
              >
                {isLoading ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-white" />
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          )}

          {/* ===== STEP 2: Verify Code ===== */}
          {step === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1e293b] ml-1">
                  Verification Code
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#214347] transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setCode(val)
                    }}
                    required
                    maxLength={6}
                    className="h-13 pl-12 rounded-xl border-gray-200 bg-gray-50/50 !text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#214347] focus-visible:ring-0 transition-all text-sm font-medium tracking-[0.3em] text-center"
                  />
                </div>
              </div>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-400 font-medium">
                    Resend code in{" "}
                    <span className="text-[#214347] font-bold">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-sm font-semibold text-[#214347] hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full h-12 bg-[#214347] hover:bg-[#1a3539] text-white rounded-lg font-bold text-base transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-white" />
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>
          )}

          {/* ===== STEP 3: Reset Password ===== */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1e293b] ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#214347] transition-colors">
                    <Lock size={18} />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-13 pl-12 pr-12 rounded-xl border-gray-200 bg-gray-50/50 !text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#214347] focus-visible:ring-0 transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#214347] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOffIcon size={18} />
                    ) : (
                      <EyeIcon size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1e293b] ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#214347] transition-colors">
                    <Lock size={18} />
                  </div>
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-13 pl-12 pr-12 rounded-xl border-gray-200 bg-gray-50/50 !text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#214347] focus-visible:ring-0 transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#214347] transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOffIcon size={18} />
                    ) : (
                      <EyeIcon size={18} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#214347] hover:bg-[#1a3539] text-white rounded-lg font-bold text-base transition-colors shadow-sm"
              >
                {isLoading ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-white" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          {/* ===== STEP 4: Success ===== */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-emerald-50 p-5 rounded-full">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                </div>
              </div>
              <p className="text-gray-500 font-medium text-sm">
                You can now sign in with your new password.
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-[#214347] hover:bg-[#1a3539] text-white rounded-lg font-bold text-base transition-colors shadow-sm"
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>

        {step !== "success" && (
          <CardFooter className="flex justify-center border-t border-gray-100 py-6 !bg-white">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-gray-500 font-medium hover:text-[#214347] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
