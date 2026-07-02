import { Outlet } from "react-router";
import AffiliateBanner from "~/components/affiliate-banner";
import Footer from "~/components/footer";
import Header from "~/components/header";

export default function LandingLayout() {
  return (
    <div className="landing-theme min-h-screen bg-background text-foreground">
      <Header />
      <AffiliateBanner />
      <Outlet />
      <Footer />
    </div>
  );
}
