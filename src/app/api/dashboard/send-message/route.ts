import { Messages } from "@/models/MessageModel";
import Uploads from "@/models/UploadModel";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide required values.`,
        },
        { status: 400 }
      );
    }

    const { content, postId } = body;

    if (content == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide content value.`,
        },
        { status: 400 }
      );
    }

    if (postId == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide postId value.`,
        },
        { status: 400 }
      );
    }

    let newMessage = await Messages.create({
      postId,
      content,
    });

    if (!newMessage) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Failed to upload message`,
        },
        { status: 400 }
      );
    }

    const updatedUser = await Uploads.findOneAndUpdate(
      { _id: postId, isAcceptingMessages: true },
      {
        $push: { messages: newMessage._id },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return Response.json(
        {
          status: false,
          statusCode: 403,
          message: `Failed to update message`,
        },
        { status: 403 }
      );
    }

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `Message stored successfully`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message: error.message || `Error on send message controller.`,
      },
      { status: 500 }
    );
  }
}
