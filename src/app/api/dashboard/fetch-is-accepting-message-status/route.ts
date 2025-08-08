import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = await new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide userId value`,
        },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId).select("isAcceptingMessages");

    if (!user) {
      return Response.json(
        {
          status: false,
          statusCode: 404,
          message: `User not found`,
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `Data fetched successfully`,
        data: {
          isAcceptingMessages: user.isAcceptingMessages,
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
            : `Error on fetch-is-accepting-message-status route`,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = await new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide userId value`,
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { isAcceptingMessages } = body;

    if (isAcceptingMessages == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide isAcceptingMessages value`,
        },
        { status: 400 }
      );
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          isAcceptingMessages,
        },
      },
      { new: true }
    ).select("isAcceptingMessages");

    if (!user) {
      return Response.json(
        {
          status: false,
          statusCode: 404,
          message: `User not found`,
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `Data fetched successfully`,
        data: {
          isAcceptingMessages: user.isAcceptingMessages,
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
            : `Error on fetch-is-accepting-message-status route`,
      },
      { status: 500 }
    );
  }
}
