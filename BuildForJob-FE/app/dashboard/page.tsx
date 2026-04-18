import { redirect } from "next/navigation";

// Redirect root dashboard to feed (default landing after auth)
export default function DashboardRootPage() {
  redirect("/dashboard/feed");
}
