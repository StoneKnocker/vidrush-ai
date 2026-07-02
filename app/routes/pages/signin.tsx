import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { redirect } from "react-router";
import { GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth.client";
import { AppLogo } from "~/components/app-logo";
import { Link } from "~/components/i18n-link";
import { serverAuth } from "~/lib/auth/auth.server";
import { getLocalizedPath } from "~/lib/utils";
import { getLocale } from "~/middlewares/i18next";
import type { Route } from "./+types/signin";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await serverAuth.api.getSession({
    headers: request.headers,
  });

  if (session?.user) {
    throw redirect(getLocalizedPath(getLocale(context), "/user/creations"));
  }

  return null;
}

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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
      setIsLoading(false);
      window.location.href = getLocalizedPath(i18n.language, "/user/creations");
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
      await authClient.signIn.social({
        provider: "google",
        callbackURL: getLocalizedPath(i18n.language, "/user/creations"),
      });
    } catch (error) {
      console.error("Google login failed:", error);
      setIsGoogleLoading(false);
      setError(t("auth.errors.googleLoginFailed"));
    }
  };

  const handleBack = () => {
    setIsOtpSent(false);
    setOtp("");
    setError("");
  };

  return (
    <div className="landing-theme container relative grid h-screen max-w-none flex-col items-center justify-center bg-background text-foreground lg:grid-cols-2 lg:px-0">
      {/* Left Panel: Branding / Visuals */}
      <div className="relative hidden h-full flex-col border-[#3d3a39] border-r bg-[#050507] p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[#050507]" />
        <div className="relative z-20 flex items-center font-medium text-lg">
          <AppLogo />
        </div>

        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-center bg-cover mix-blend-overlay"
          style={{
            backgroundImage: "url('/hero.webp')",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,7,0.2),#050507)]" />

        <div className="relative z-20 mt-auto">
          <blockquote className="flex flex-col gap-2 border-[#3d3a39] border-l pl-5">
            <p className="text-[#f2f2f2] text-lg">
              &ldquo;{t("auth.testimonial.quote")}&rdquo;
            </p>
            <footer className="text-[#b8b3b0] text-sm">
              {t("auth.testimonial.author")}
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex h-full w-full items-center justify-center bg-background lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center gap-6 px-4 sm:w-[350px]">
          {/* Header */}
          <div className="flex flex-col gap-2 text-center">
            <h1 className="font-semibold text-2xl tracking-tight">
              {isOtpSent
                ? t("auth.verifyYourEmail")
                : t("auth.createAnAccount")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isOtpSent
                ? t("auth.verificationCodeSentTo")
                : t("auth.enterEmailBelow")}
              {isOtpSent && (
                <span className="mt-1 block font-medium text-foreground">
                  {email}
                </span>
              )}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md border border-red-900/40 bg-red-950/30 p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form Content */}
          <div className="grid gap-6">
            {!isOtpSent ? (
              <>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading || isGoogleLoading}
                  onClick={handleGoogleLogin}
                  className="border-[#3d3a39] bg-[#101010] text-[#f2f2f2] hover:border-[#00d992]/70 hover:bg-black/20 hover:text-[#00d992]"
                >
                  {!isGoogleLoading && <GoogleIcon className="mr-2 size-4" />}
                  Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t("auth.orContinueWith")}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSendOtp}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="sr-only">
                        {t("auth.email")}
                      </Label>
                      <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        className="border-[#3d3a39] bg-[#101010] text-[#f2f2f2] placeholder:text-[#8b949e]"
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
                    >
                      {isLoading ? (
                        <>
                          <Mail className="mr-2 size-4 animate-pulse" />
                          {t("auth.sendingCode")}
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 size-4" />
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
                    <Label htmlFor="otp" className="sr-only">
                      {t("auth.verificationCode")}
                    </Label>
                    <Input
                      id="otp"
                      placeholder={t("auth.enterSixDigitCode")}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoCapitalize="none"
                      autoComplete="one-time-code"
                      disabled={isLoading || isGoogleLoading}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      required
                      className="border-[#3d3a39] bg-[#101010] text-center font-mono text-[#f2f2f2] text-lg tracking-widest placeholder:text-[#8b949e]"
                    />
                  </div>
                  <Button
                    disabled={isLoading || isGoogleLoading || otp.length !== 6}
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <CheckCircle2 className="mr-2 size-4 animate-pulse" />
                        {t("auth.verifying")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 size-4" />
                        {t("auth.verifyAndSignIn")}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-[#b8b3b0] hover:bg-[#101010] hover:text-[#00d992]"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    {t("auth.backToEmail")}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Terms */}
          <p className="px-8 text-center text-muted-foreground text-sm">
            {t("auth.byContinuing")}{" "}
            <Link
              to="/terms-and-conditions"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t("terms")}
            </Link>{" "}
            {t("auth.and")}{" "}
            <Link
              to="/privacy-policy"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t("privacyLabel")}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
