import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { pusherServer } from "@/app/libs/pusher";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { authOptions } from "@/app/libs/authOptions";

export default async function handler(
  request: NextApiRequest, 
  response: NextApiResponse
) {
  console.log("Request headers:", request.headers);
  console.log("Request cookies:", request.cookies);

  try {
    const session = await getServerSession(request, response, authOptions);
    console.log("Session data:", session);

    if (!session?.user?.email) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const socketId = request.body.socket_id;
    const channel = request.body.channel_name;
    const data = {
      user_id: session.user.email,
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
    return response.status(200).send(authResponse);
  } catch (error) {
    console.error("Error in /api/pusher/auth handler:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
};
