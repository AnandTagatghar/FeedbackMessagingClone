import dbConnect from "@/lib/dbConnect";
import { Messages } from "@/models/MessageModel";
import Uploads from "@/models/UploadModel";
import mongoose, { Schema } from "mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();

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

    const { content, postId, userId } = body;

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

    if (userId == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide userId value.`,
        },
        { status: 400 }
      );
    }

    const newMessage = await Messages.create({
      content,
      postId,
    });

    if (!newMessage) {
      return Response.json(
        {
          status: false,
          statusCode: 500,
          message: "Failed to create a message.",
        },
        { status: 500 }
      );
    }

    const post = await Uploads.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(postId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.isAcceptingMessages": true,
        },
      },
      {
        $set: {
          messages: {
            $cond: {
              if: { $isArray: "$messages" },
              then: {
                $concatArrays: [
                  "$messages",
                  [new mongoose.Types.ObjectId(newMessage._id)],
                ],
              },
              else: [new mongoose.Types.ObjectId(newMessage._id)],
            },
          },
        },
      },
      {
        $project: {
          createdAt: 1,
          description: 1,
          keys: 1,
          messages: 1,
          title: 1,
          username: "$user.username",
          email: "$user.email",
        },
      },
    ]);

    await Uploads.updateOne(
      {
        _id: new mongoose.Types.ObjectId(postId),
      },
      {
        $addToSet: { messages: new mongoose.Types.ObjectId(newMessage._id) },
      }
    );

    if (post == undefined || post.length == 0) {
      return Response.json(
        {
          status: false,
          statusCode: 500,
          message: `Failed to upload message.`,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `New message created successfully.`,
        data: post[0],
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
