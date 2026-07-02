import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth.client";
import { useLoginModal } from "~/hooks/use-login-modal";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function LoginModal() {
  const { t } = useTranslation();
  const { isOpen, closeLoginModal } = useLoginModal();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");

  // Listen for OAuth popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, error } = event.data || {};

      if (type === "OAUTH_SUCCESS") {
        // Refresh auth state when popup closes successfully
        queryClient.invalidateQueries({ queryKey: ["auth-session"] });
        toast.success(t("auth.toast.signedIn"));
        // Dispatch event for workspace to show after login
        window.dispatchEvent(new CustomEvent("auth:loginSuccess"));
      } else if (type === "OAUTH_ERROR" && error) {
        setError(error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [queryClient, t]);

  const resetState = () => {
    setEmail("");
    setOtp("");
    setIsOtpSent(false);
    setError("");
    setIsLoading(false);
    setIsGoogleLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
      closeLoginModal();
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setIsOtpSent(true);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setError(getErrorMessage(error, t("auth.errors.sendOtpFailed")));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !email) return;

    setIsLoading(true);
    setError("");

    try {
      await authClient.signIn.emailOtp({
        email,
        otp,
      });
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      toast.success(t("auth.toast.loggedIn"));
      resetState();
      closeLoginModal();
      // Dispatch event for workspace to show after login
      window.dispatchEvent(new CustomEvent("auth:loginSuccess"));
    } catch (error) {
      console.error("OTP login failed:", error);
      setError(getErrorMessage(error, t("auth.errors.invalidOtp")));
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");

    try {
      const popupUrl = "/auth/popup";

      const popup = window.open(
        popupUrl,
        "google_oauth_popup",
        "width=500,height=600,scrollbars=yes,resizable=yes",
      );

      if (!popup) {
        throw new Error("Popup was blocked");
      }

      // Close modal immediately after opening popup
      closeLoginModal();
    } catch (err) {
      console.error("Google login failed:", err);
      setIsGoogleLoading(false);
      setError(getErrorMessage(err, t("auth.errors.googleLoginFailed")));
    }
  };

  const handleBack = () => {
    setIsOtpSent(false);
    setOtp("");
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#3d3a39] bg-[#101010] text-[#f2f2f2] shadow-[0_0_50px_rgba(0,217,146,0.12)] sm:max-w-[400px] [&>button:hover]:text-[#00d992] [&>button]:text-[#b8b3b0]">
        <DialogHeader>
          <DialogTitle className="text-[#f2f2f2]">
            {isOtpSent
              ? t("auth.verifyYourEmail")
              : t("auth.signInToYourAccount")}
          </DialogTitle>
          <DialogDescription className="text-[#b8b3b0]">
            {isOtpSent ? (
              <>
                {t("auth.verificationCodeSentTo")}
                <span className="mt-1 block font-medium text-[#f2f2f2]">
                  {email}
                </span>
              </>
            ) : (
              t("auth.enterEmailToSignIn")
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-red-900/40 bg-red-950/30 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {!isOtpSent ? (
            <>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading || isGoogleLoading}
                onClick={handleGoogleLogin}
                className="border-[#3d3a39] bg-[#050507] text-[#f2f2f2] hover:border-[#00d992]/70 hover:bg-black/20 hover:text-[#00d992]"
              >
                {!isGoogleLoading && <GoogleIcon className="mr-2 h-4 w-4" />}
                Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-[#3d3a39] border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#101010] px-2 text-[#b8b3b0]">
                    {t("auth.orContinueWith")}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSendOtp}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="modal-email" className="sr-only">
                      {t("auth.email")}
                    </Label>
                    <Input
                      id="modal-email"
                      placeholder="name@example.com"
                      type="email"
                      className="border-[#3d3a39] bg-[#050507] text-[#f2f2f2] placeholder:text-[#817b77] focus-visible:border-[#00d992]/70 focus-visible:ring-[#00d992]/30"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading || isGoogleLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    disabled={isLoading || isGoogleLoading}
                    type="submit"
                    className="border border-[#00d992]/70 bg-[#00d992] text-[#06110d] shadow-[0_0_24px_rgba(0,217,146,0.16)] hover:bg-[#27e9aa] hover:text-[#06110d]"
                  >
                    {isLoading ? (
                      <>
                        <Mail className="mr-2 h-4 w-4 animate-pulse" />
                        {t("auth.sendingCode")}
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {t("auth.sendVerificationCode")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="modal-otp" className="sr-only">
                    {t("auth.verificationCode")}
                  </Label>
                  <Input
                    id="modal-otp"
                    placeholder={t("auth.enterSixDigitCode")}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoCapitalize="none"
                    autoComplete="one-time-code"
                    disabled={isLoading || isGoogleLoading}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="border-[#3d3a39] bg-[#050507] text-center font-mono text-[#f2f2f2] text-lg tracking-widest placeholder:text-[#817b77] focus-visible:border-[#00d992]/70 focus-visible:ring-[#00d992]/30"
                  />
                </div>
                <Button
                  disabled={isLoading || isGoogleLoading || otp.length !== 6}
                  type="submit"
                  className="border border-[#00d992]/70 bg-[#00d992] text-[#06110d] shadow-[0_0_24px_rgba(0,217,146,0.16)] hover:bg-[#27e9aa] hover:text-[#06110d]"
                >
                  {isLoading ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 animate-pulse" />
                      {t("auth.verifying")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t("auth.verifyAndSignIn")}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-[#b8b3b0] hover:bg-[#050507] hover:text-[#00d992]"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("auth.backToEmail")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
