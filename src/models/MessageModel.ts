import { model, Model, models, Schema, Types } from "mongoose";
import Uploads from "./UploadModel";

export interface MessageSchemaInterface extends Document {
  content: string;
  postId: Types.ObjectId;
  createdAt: Date;
}

export const MessageSchema: Schema<MessageSchemaInterface> =
  new Schema<MessageSchemaInterface>({
    content: {
      type: String,
      required: true,
      trim: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "uploads",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

MessageSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      await Uploads.updateMany(
        {
          messages: doc._id,
        },
        {
          $pull: { messages: doc._id },
        }
      );
      console.log(`Success delete`);
    } catch (error: unknown) {
      console.log(
        `Error: ${error instanceof Error ? error.message : "Something went wrong"}`
      );
    }
  }
});

export const Messages =
  (models.messages as Model<MessageSchemaInterface>) ||
  model<MessageSchemaInterface>("messages", MessageSchema);
