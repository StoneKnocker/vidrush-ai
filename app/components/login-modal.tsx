import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";
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
import { refreshAuthSession } from "~/lib/auth/auth-session";
import { openOAuthPopup } from "~/lib/auth/oauth-popup";

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
      // Do not abort an in-flight popup; session refresh still completes in openOAuthPopup.
      // Only reset form UI when the user dismisses the dialog.
      if (!isGoogleLoading) {
        resetState();
      } else {
        setError("");
        setIsOtpSent(false);
        setOtp("");
        setEmail("");
        setIsLoading(false);
      }
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
      await refreshAuthSession(queryClient);
      toast.success(t("auth.toast.loggedIn"));
      resetState();
      closeLoginModal();
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
      const result = await openOAuthPopup({ provider: "google" });

      switch (result.status) {
        case "success": {
          // Ensure React Query reflects cookie session even if message path already checked.
          await refreshAuthSession(queryClient);
          toast.success(t("auth.toast.signedIn"));
          resetState();
          closeLoginModal();
          break;
        }
        case "blocked": {
          setError(t("auth.errors.popupBlocked"));
          setIsGoogleLoading(false);
          break;
        }
        case "cancelled": {
          setIsGoogleLoading(false);
          break;
        }
        case "error": {
          setError(result.message || t("auth.errors.googleLoginFailed"));
          setIsGoogleLoading(false);
          break;
        }
      }
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
      <DialogContent className="bg-card text-foreground shadow-[0_0_50px_rgba(0,217,146,0.12)] sm:max-w-[400px] [&>button:hover]:text-primary [&>button]:text-muted-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isOtpSent
              ? t("auth.verifyYourEmail")
              : t("auth.signInToYourAccount")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isGoogleLoading ? (
              t("auth.completeSignInInPopup")
            ) : isOtpSent ? (
              <>
                {t("auth.verificationCodeSentTo")}
                <span className="mt-1 block font-medium text-foreground">
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
                className="bg-background text-foreground hover:border-primary/70 hover:bg-black/20 hover:text-primary"
              >
                {!isGoogleLoading && <GoogleIcon className="mr-2 h-4 w-4" />}
                {isGoogleLoading ? t("auth.waitingForGoogle") : "Google"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
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
                      className="bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary/70 focus-visible:ring-primary/30"
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
                    className="border border-primary/70 bg-primary text-primary-foreground shadow-[0_0_24px_rgba(0,217,146,0.16)] hover:bg-primary/90 hover:text-primary-foreground"
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
                    className="bg-background text-center font-mono text-foreground text-lg tracking-widest placeholder:text-muted-foreground focus-visible:border-primary/70 focus-visible:ring-primary/30"
                  />
                </div>
                <Button
                  disabled={isLoading || isGoogleLoading || otp.length !== 6}
                  type="submit"
                  className="border border-primary/70 bg-primary text-primary-foreground shadow-[0_0_24px_rgba(0,217,146,0.16)] hover:bg-primary/90 hover:text-primary-foreground"
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
                  className="w-full text-muted-foreground hover:bg-background hover:text-primary"
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
