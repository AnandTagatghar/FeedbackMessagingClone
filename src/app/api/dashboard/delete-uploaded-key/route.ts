import { deleteObject } from "@/utils/s3Features";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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

    await deleteObject(key);

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `Successfully deleted.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message: error.message || `Error on delete-uploaded-kye router`,
      },
      { status: 500 }
    );
  }
}
