import dbConnect from "@/lib/dbConnect";
import Uploads from "@/models/UploadModel";
import { getObjectURL } from "@/utils/s3Features";
import { Types } from "mongoose";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide userId parameter`,
        },
        { status: 400 }
      );
    }

    const posts = await Uploads.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
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
      { $sort: { createdAt: -1 } },
      {
        $project: {
          username: "$user.username",
          email: "$user.email",
          messages: 1,
          keys: 1,
          title: 1,
          description: 1,
          _id: 1,
          githubLink: 1,
          projectLink: 1,
          createdAt: 1,
        },
      },
    ]);

    if (posts == undefined || posts.length == 0) {
      return Response.json(
        {
          status: true,
          statusCode: 200,
          message: `No posts found`,
        },
        { status: 200 }
      );
    }

    const updatedPosts = await Promise.all(
      posts.map(async (post) => {
        const singleKey = await Promise.all(
          post.keys.map(async (key: string) => {
            return {
              key,
              ref: await getObjectURL(key),
            };
          })
        );

        return {
          ...post,
          keys: singleKey,
        };
      })
    );

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `All posts found successfully`,
        data: {
          posts: updatedPosts,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message: error.message || `Error on get-my-projects route`,
      },
      { status: 500 }
    );
  }
}
