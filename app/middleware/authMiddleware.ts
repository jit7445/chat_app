// app/middleware/authMiddleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import this for token-based authentication
import { NextApiRequest } from "next";

const secret = process.env.NEXTAUTH_SECRET as string; // Your NextAuth secret

export async function ensureAuthenticated(request: NextRequest) {
  // Extract token from the request
  const token = await getToken({ req: request as any, secret });

  if (!token) {
    return NextResponse.json({ message: "Unauthorized. Please sign in." }, { status: 401 });
  }

  // Continue processing the request if authenticated
  return NextResponse.next();
}
