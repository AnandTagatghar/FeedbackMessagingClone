import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import Uploads from "@/models/UploadModel";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        {
          status: false,
          statusCode: 401,
          message: `Unauthorized please sign-in`,
        },
        { status: 401 }
      );
    }

    const user = session?.user as User;

    const body = await request.json();

    if (body == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide required values`,
        },
        { status: 400 }
      );
    }

    const { title, description, fileKeys, githubLink, projectLink } = body;

    if (title == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide title value`,
        },
        { status: 400 }
      );
    }

    if (description == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide description value`,
        },
        { status: 400 }
      );
    }

    if (fileKeys == undefined || fileKeys.length == 0) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide file keys values`,
        },
        { status: 400 }
      );
    }

    const newPost = await Uploads.create({
      title,
      description,
      user: user._id,
      keys: fileKeys,
      ...(githubLink != undefined && githubLink),
      ...(projectLink != undefined && projectLink),
    });

    await UserModel.findByIdAndUpdate(user._id, {
      $push: {
        uploads: newPost._id,
      },
    });

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `Post uploaded successfully`,
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
            : `Error on check unique username controller`,
      },
      { status: 500 }
    );
  }
}
