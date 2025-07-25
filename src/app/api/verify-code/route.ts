import UserModel from "@/models/UserModel";

export async function POST(request: Request) {
  try {
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

    const { username, verifyCode } = body;

    if (username == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide username value`,
        },
        { status: 400 }
      );
    }
    if (verifyCode == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide verify code value`,
        },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({
      $or: [{ email: username }, { username }],
    });

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

    const checkVerificationCodeMatch = verifyCode == user.verifyCode;
    const checkVerificationCodeExpired = new Date() < user.verifyCodeExpiry;

    if (!checkVerificationCodeMatch) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Verification code not matched`,
        },
        { status: 400 }
      );
    }

    if (!checkVerificationCodeExpired) {
      return Response.json(
        {
          status: false,
          statusCode: 410,
          message: `Verification code expired`,
        },
        { status: 410 }
      );
    }

    user.isVerified = true;
    await user.save();

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `Verified please login`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message: error.message || `Error on sign up controller`,
      },
      { status: 500 }
    );
  }
}
