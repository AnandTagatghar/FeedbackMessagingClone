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
          message: `Please provide postId parameter`,
        },
        { status: 400 }
      );
    }

    const post = await Uploads.aggregate([
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
              sortBy: { createdBy: -1 },
            },
          },
        },
      },
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

    if (post == undefined || post.length == 0) {
      return Response.json(
        {
          status: true,
          statusCode: 200,
          message: `No post found`,
        },
        { status: 200 }
      );
    }

    let updatedKeys = await Promise.all(
      post[0].keys.map(async (key: any) => {
        return {
          key,
          signedUrl: `await getObjectURL(key)`,
        };
      })
    );

    let dateTime = new Date(post[0].createdAt);

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `All posts found successfully`,
        data: {
          postIdData: {
            ...post[0],
            keys: updatedKeys,
            createdAt: `${dateTime.getDate().toString().padStart(2, "0")}-${dateTime.getMonth().toString().padStart(2, "0")}-${dateTime.getFullYear().toString().padStart(2, "0")} ${dateTime.getHours().toString().padStart(2, "0")}:${dateTime.getMinutes().toString().padStart(2, "0")}`,
          },
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
