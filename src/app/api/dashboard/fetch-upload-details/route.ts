import dbConnect from "@/lib/dbConnect";
import Uploads from "@/models/UploadModel";
import { getObjectURL } from "@/utils/s3Features";
import { Types } from "mongoose";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const postId = searchParams.get("postId");

    if (postId == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide postId value`,
        },
        { status: 400 }
      );
    }

    const allPosts = await Uploads.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(postId),
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
        $lookup: {
          from: "messages",
          localField: "messages",
          foreignField: "_id",
          as: "messages",
        },
      },
      {
        $set: {
          messages: {
            $sortArray: {
              input: "$messages",
              sortBy: { createdAt: -1 },
            },
          },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          username: "$user.username",
          email: "$user.email",
          userId: "$user._id",
          isAcceptingMessages: "$user.isAcceptingMessages",
          keys: 1,
          createdAt: 1,
          _id: 1,
          githubLink: 1,
          projectLink: 1,
          messages: 1,
        },
      },
    ]);

    if (allPosts == undefined || allPosts.length == 0) {
      return Response.json(
        {
          status: false,
          statusCode: 404,
          message: `Post is not available`,
        },
        { status: 404 }
      );
    }

    const updatedPosts = await Promise.all(
      allPosts.map(async (post) => {
        const signedKeys = await Promise.all(
          post.keys.map(async (key: string) => `await getObjectURL(key)`)
        );

        return {
          ...post,
          keys: signedKeys,
        };
      })
    );

    return Response.json({
      status: true,
      statusCode: 200,
      message: "Posts fetched successfully",
      data: updatedPosts[0],
    });
  } catch (error: any) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message: error.message || `Error on fetch all uploads`,
      },
      { status: 500 }
    );
  }
}
