import dbConnect from "@/lib/dbConnect";
import Uploads from "@/models/UploadModel";
import { getObjectURL } from "@/utils/s3Features";

export async function GET() {
  try {
    await dbConnect();
    const allPosts = await Uploads.aggregate([
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
        $project: {
          title: 1,
          description: 1,
          username: "$user.username",
          email: "$user.email",
          userId: "$user._id",
          keys: 1,
          createdAt: 1,
          _id: 1,
        },
      },
    ]);

    if (allPosts == undefined || allPosts.length == 0) {
      return Response.json(
        {
          status: false,
          statusCode: 404,
          message: `Posts are not available`,
          data: [],
        },
        { status: 404 }
      );
    }

    const updatedPosts = await Promise.all(
      allPosts.map(async (post) => {
        const signedKeys = await Promise.all(
          post.keys.map(async (obj: { type: string; key: string }) => {
            return {
              signedUrl: await getObjectURL(obj.key),
              key: obj.key,
              type: obj.type,
            };
          })
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
      data: updatedPosts,
    });
  } catch (error: unknown) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message:
          error instanceof Error ? error.message : `Error on fetch all uploads`,
      },
      { status: 500 }
    );
  }
}
