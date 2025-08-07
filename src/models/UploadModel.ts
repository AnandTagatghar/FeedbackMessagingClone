import { model, Model, models, Schema, Types } from "mongoose";

export interface UploadsSchemaInterface extends Document {
  title: string;
  description: string;
  user: Types.ObjectId;
  createdAt: Date;
  keys: string[];
  githubLink: string;
  projectLink: string;
  messages: Types.ObjectId[];
}

export const UploadsSchema: Schema<UploadsSchemaInterface> =
  new Schema<UploadsSchemaInterface>({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "messages",
      },
    ],
    keys: [
      {
        key: {
          type: String,
        },
        type: {
          type: String,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    githubLink: {
      type: String,
    },
    projectLink: {
      type: String,
    },
  });

const Uploads =
  (models.uploads as Model<UploadsSchemaInterface>) ||
  model<UploadsSchemaInterface>("uploads", UploadsSchema);

export default Uploads;
