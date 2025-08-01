import Uploads from "@/models/UploadModel";
import { deleteObject } from "@/utils/s3Features";

export async function DELETE(request: Request) {
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

    const { key, postId } = body;

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

    if (postId == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide postId value`,
        },
        { status: 400 }
      );
    }

    await Uploads.updateOne(
      {
        _id: postId,
      },
      {
        $pull: { keys: key },
      }
    );

    await deleteObject(key);

    return Response.json({
      status: true,
      statusCode: 200,
      message: `Delete key success`,
    });
    
  } catch (error: any) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message: error.message || `Error on delete-key-from-post route`,
      },
      { status: 500 }
    );
  }
}
