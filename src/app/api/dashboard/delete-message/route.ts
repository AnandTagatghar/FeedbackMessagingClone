import { Messages } from "@/models/MessageModel";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (messageId == undefined) {
      return Response.json(
        {
          status: false,
          statusCode: 400,
          message: `Please provide messageId value`,
        },
        {
          status: 400,
        }
      );
    }

    await Messages.findOneAndDelete({
      _id: messageId,
    });

    return Response.json(
      {
        status: true,
        statusCode: 200,
        message: `Message deleted successfully`,
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    return Response.json(
      {
        status: false,
        statusCode: 500,
        message:
          error instanceof Error
            ? error.message
            : `Error on delete-message route`,
      },
      {
        status: 500,
      }
    );
  }
}
