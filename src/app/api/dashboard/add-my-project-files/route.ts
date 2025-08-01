import Uploads from "@/models/UploadModel";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (body == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide required fields`,
        },
        {
          status: 400,
        }
      );
    }

    const { keys, postId } = body;

    if (postId == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide postId field`,
        },
        {
          status: 400,
        }
      );
    }

    console.log("*".repeat(50));
    console.log(keys);

    await Uploads.findByIdAndUpdate(
      postId,
      {
        $addToSet: {
          keys: { $each: keys },
        },
      },
      { new: true }
    );

    return Response.json({
      status: true,
      statusCode: 200,
      message: `File upload success`,
    });
  } catch (error: any) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message: error.message || `Error on add-my-projects-fiels router`,
      },
      {
        status: 500,
      }
    );
  }
}
