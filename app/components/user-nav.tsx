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
    "cursor-pointer rounded-md text-muted-foreground focus:bg-primary focus:text-primary-foreground [&_svg]:text-primary focus:[&_svg]:text-primary-foreground";

  return (
    <div className="flex items-center gap-2">
      {credits && credits.total >= 0 && (
        <div className="flex h-8 items-center gap-1.5 rounded-md border bg-card px-2.5 text-primary shadow-[0_0_15px_rgba(92,88,85,0.12)]">
          <CoinsIcon className="h-4 w-4" />
          <span className="font-mono text-sm">{credits.total}</span>
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            aria-label={t("userNav.accountMenu", "Open account menu")}
            className="h-9 cursor-pointer gap-1 rounded-md border border-transparent px-1.5 text-muted-foreground hover:hover:bg-card hover:text-primary focus-visible:ring-primary/40 data-[state=open]:border-primary/60 data-[state=open]:bg-card data-[state=open]:text-primary"
          >
            <Avatar className="size-8 border ">
              <AvatarImage src={avatar} alt={alt} />
              <AvatarFallback className="bg-card font-bold text-primary text-xs uppercase">
                {initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDownIcon className="h-3 w-3 text-current" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          forceMount
          className="w-64 bg-card p-2 text-foreground shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_20px_rgba(0,217,146,0.08)]"
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-3 text-left text-sm">
              <Avatar className="h-9 w-9 rounded-md border ">
                <AvatarImage src={avatar} alt={alt} />
                <AvatarFallback className="rounded-md bg-card text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">
                  {user.name}
                </span>
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2 bg-secondary" />
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
          <DropdownMenuSeparator className="my-2 bg-secondary" />
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="cursor-pointer rounded-md text-muted-foreground focus:bg-red-950/40 focus:text-red-300 data-[disabled]:cursor-not-allowed [&_svg]:text-muted-foreground focus:[&_svg]:text-red-300"
          >
            <LogOutIcon />
            {isSigningOut ? t("userNav.signingOut") : t("userNav.logOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
