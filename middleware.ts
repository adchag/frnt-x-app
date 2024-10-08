import { updateSession } from "@/lib/supabase/supabase.middleware";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/supabase.server";

export async function middleware(request: NextRequest) {
  // update user's auth session
  const supabaseResponse = await updateSession(request);

  // Check if the request is for the dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If the user is not authenticated, redirect to the signin page
    if (!user) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
