
// app/middleware.ts
import { ensureAuthenticated } from "./middleware/authMiddleware";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return ensureAuthenticated(request);
}

export const config = {
  matcher: ["/api/pusher/:path*"], // Apply middleware to routes under /api/pusher/
};
