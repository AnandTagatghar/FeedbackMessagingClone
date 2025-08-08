import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const username = searchParams.get("username");

    if (username == undefined) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide username value`,
        },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({
      username,
    });

    if (!user) {
      return NextResponse.json(
        {
          status: true,
          statusCode: 200,
          message: `Username is unique`,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: false,
          statusCode: 409,
          message: `Username is already taken`,
        },
        { status: 409 }
      );
    }
  } catch (error: unknown) {
    return NextResponse.json(
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
