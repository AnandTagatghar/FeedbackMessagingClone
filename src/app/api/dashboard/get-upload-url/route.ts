import { putObjectURL } from "@/utils/s3Features";
import { v4 } from "uuid";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");

    if (fileName == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide file name`,
        },
        { status: 400 }
      );
    }

    if (fileType == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide file type`,
        },
        { status: 400 }
      );
    }

    const key = v4() + `.${fileName.split(".").at(-1)}`;

    const signedUrl = await putObjectURL(fileType, key);

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `Successfully generated signedUrl for the provided file`,
        data: {
          signedUrl,
          key,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message: error.message || `Error at get upload url controller`,
      },
      { status: 500 }
    );
  }
}
