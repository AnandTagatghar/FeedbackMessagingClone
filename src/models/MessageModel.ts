import { model, Model, models, Schema, Types } from "mongoose";

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

export const Messages =
  (models.messages as Model<MessageSchemaInterface>) ||
  model<MessageSchemaInterface>("messages", MessageSchema);
