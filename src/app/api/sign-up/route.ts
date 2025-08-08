import UserModel from "@/models/UserModel";
import generateVerificationDetails from "@/utils/generateVerificationDetails";
import sendVerificationCodeEmail from "@/utils/sendVerificationCodeEmail";

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

    const { username, email, password } = body;

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
    if (email == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide email value`,
        },
        { status: 400 }
      );
    }
    if (password == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide password value`,
        },
        { status: 400 }
      );
    }

    const checkForUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    const { verifyCode, verifyCodeExpiry } = generateVerificationDetails;

    if (checkForUser && checkForUser.isVerified) {
      return Response.json(
        {
          status: false,
          statusCode: 409,
          message: `Username or Email already taken`,
        },
        { status: 409 }
      );
    } else if (checkForUser && !checkForUser.isVerified) {
      if (process.env.NODE_ENV !== "development") {
        await sendVerificationCodeEmail(username, verifyCode, email);
      }

      checkForUser.verifyCode = verifyCode;
      checkForUser.verifyCodeExpiry = verifyCodeExpiry;
      await checkForUser.save();

      return Response.json(
        {
          status: true,
          statusCode: 202,
          message: `Please verify your email, otp has sent to your email address`,
        },
        { status: 202 }
      );
    } else {
      const newUser = new UserModel({
        username,
        email,
        password,
      });

      if (process.env.NODE_ENV !== "development") {
        await sendVerificationCodeEmail(username, verifyCode, email);
      }

      newUser.verifyCode = verifyCode;
      newUser.verifyCodeExpiry = verifyCodeExpiry;
      await newUser.save();

      return Response.json(
        {
          status: true,
          statusCode: 202,
          message: `Sign-up processing, please verify your email address `,
        },
        { status: 202 }
      );
    }
  } catch (error: unknown) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message:
          error instanceof Error
            ? error.message
            : `Error on sign up controller`,
      },
      { status: 500 }
    );
  }
}
