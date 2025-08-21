import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { userId, isGroup, members, name } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse('Invalid data', { status: 400 });
    }

    const defaultName = name || "Default Conversation Name";
    const defaultIsGroup = isGroup !== undefined ? isGroup : false;

    if (isGroup) {
      // console.log("inside group");
      const groupMembers = members.map((member: any) => ({ id: member.value }));
      // console.log("group:", groupMembers);

      const newConversation = await prisma.conversation.create({
        data: {
          name: defaultName,
          isGroup:isGroup,
          users: {
            connect: [...groupMembers, { id: currentUser.id }]
          }
        },
        include: {
          users: true
        }
      });

      // console.log("Conversation created with ID:", newConversation.id);

      newConversation.users.forEach((user) => {
        try {
          if (user.email) {
            pusherServer.trigger(user.email, 'conversation:new', newConversation);
          }
        } catch (error) {
          console.error(`Error triggering Pusher: ${error}`);
        }
      });

      return NextResponse.json(newConversation);
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId]
            }
          },
          {
            userIds: {
              equals: [userId, currentUser.id]
            }
          }
        ]
      }
    });

    const singleConversation = existingConversations[0];

    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        
        users: {
          connect: [
            { id: currentUser.id },
            { id: userId }
          ]
        }
      },
      include: {
        users: true
      }
    });

    console.log("single conver::");

    newConversation.users.forEach((user) => {
      try {
        if (user.email) {
          pusherServer.trigger(user.email, 'conversation:new', newConversation);
        }
      } catch (error) {
        console.error(`Error triggering Pusher: ${error}`);
      }
    });

    return NextResponse.json(newConversation);
  } catch (error: any) {
    console.error(`Internal Error: ${error}`);
    return new NextResponse('Internal Error', { status: 500 });
  }
}