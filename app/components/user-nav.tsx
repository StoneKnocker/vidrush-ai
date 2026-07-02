import {
  ChevronDownIcon,
  CircleGaugeIcon,
  CoinsIcon,
  ImageIcon,
  LogOutIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAuth } from "~/hooks/use-auth";
import { useR2Domain } from "~/lib/public-env";
import { trpc } from "~/lib/trpc/trpc-provider";
import { getAvatarUrl, getLocalizedPath } from "~/lib/utils";
import { Button } from "./ui/button";

export function UserNav() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, signOut, isSigningOut } = useAuth();
  const navigate = useNavigate();
  const r2Domain = useR2Domain();
  const { data: credits } = trpc.user.getCredits.useQuery(undefined, {
    enabled: !!user,
  });

  // 确保用户已登录
  if (!isAuthenticated || !user) {
    return null;
  }

  const { avatarUrl, placeholderUrl } = getAvatarUrl(
    user?.image,
    user?.name,
    user?.email,
    r2Domain,
  );
  const initials = user?.name?.slice(0, 2);
  const alt = user?.name ?? "User avatar";
  const avatar = avatarUrl || placeholderUrl;
  const isAdmin = "role" in user && user.role === "admin";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(getLocalizedPath(i18n.language, "/"));
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const menuItemClass =
    "cursor-pointer rounded-md text-[#b8b3b0] focus:bg-[#00d992] focus:text-[#06110d] [&_svg]:text-[#00d992] focus:[&_svg]:text-[#06110d]";

  return (
    <div className="flex items-center gap-2">
      {credits && credits.total >= 0 && (
        <div className="flex h-8 items-center gap-1.5 rounded-md border border-[#3d3a39] bg-[#101010] px-2.5 text-[#00d992] shadow-[0_0_15px_rgba(92,88,85,0.12)]">
          <CoinsIcon className="h-4 w-4" />
          <span className="font-mono text-sm">{credits.total}</span>
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            aria-label={t("userNav.accountMenu", "Open account menu")}
            className="h-9 cursor-pointer gap-1 rounded-md border border-transparent px-1.5 text-[#b8b3b0] hover:border-[#3d3a39] hover:bg-[#101010] hover:text-[#00d992] focus-visible:ring-[#00d992]/40 data-[state=open]:border-[#00d992]/60 data-[state=open]:bg-[#101010] data-[state=open]:text-[#00d992]"
          >
            <Avatar className="size-8 border border-[#3d3a39]">
              <AvatarImage src={avatar} alt={alt} />
              <AvatarFallback className="bg-[#101010] font-bold text-[#00d992] text-xs uppercase">
                {initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDownIcon className="h-3 w-3 text-current" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          forceMount
          className="w-64 border-[#3d3a39] bg-[#101010] p-2 text-[#f2f2f2] shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_20px_rgba(0,217,146,0.08)]"
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 rounded-md border border-[#3d3a39] bg-[#050507] px-3 py-3 text-left text-sm">
              <Avatar className="h-9 w-9 rounded-md border border-[#3d3a39]">
                <AvatarImage src={avatar} alt={alt} />
                <AvatarFallback className="rounded-md bg-[#101010] text-[#00d992]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-[#f2f2f2]">
                  {user.name}
                </span>
                <span className="truncate text-[#b8b3b0] text-xs">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2 bg-[#3d3a39]" />
          <DropdownMenuItem
            className={menuItemClass}
            onClick={() => {
              navigate(getLocalizedPath(i18n.language, "/user/creations"));
            }}
          >
            <ImageIcon />
            {t("userNav.myCreations")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={menuItemClass}
            onClick={() => {
              navigate(getLocalizedPath(i18n.language, "/user/credits"));
            }}
          >
            <CoinsIcon />
            {t("userNav.myCredits")}
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem
              className={menuItemClass}
              onClick={() => {
                navigate("/admin/creations");
              }}
            >
              <CircleGaugeIcon />
              {t("userNav.adminPanel")}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="my-2 bg-[#3d3a39]" />
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="cursor-pointer rounded-md text-[#b8b3b0] focus:bg-red-950/40 focus:text-red-300 data-[disabled]:cursor-not-allowed [&_svg]:text-[#b8b3b0] focus:[&_svg]:text-red-300"
          >
            <LogOutIcon />
            {isSigningOut ? t("userNav.signingOut") : t("userNav.logOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
