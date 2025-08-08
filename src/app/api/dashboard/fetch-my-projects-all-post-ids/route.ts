import dbConnect from "@/lib/dbConnect";
import Uploads from "@/models/UploadModel";
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
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);

    if (posts == undefined || posts.length == 0) {
      return Response.json(
        {
          status: true,
          statusCode: 200,
          message: `No posts found`,
          data: { postsId: [] },
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `All posts found successfully`,
        data: {
          postsId: posts,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message:
          error instanceof Error
            ? error.message
            : `Error on get-my-projects route`,
      },
      { status: 500 }
    );
  }
}
