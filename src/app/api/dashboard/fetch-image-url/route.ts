import { getObjectURL } from "@/utils/s3Features";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide key value`,
        },
        { status: 400 }
      );
    }

    const signedUrl = await getObjectURL(key);

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `Provided key url generated successfully`,
        data: { signedUrl },
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
            : `Error on fetch image url controller`,
      },
      { status: 500 }
    );
  }
}
