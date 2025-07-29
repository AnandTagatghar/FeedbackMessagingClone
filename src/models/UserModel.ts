import { Model, model, models, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface UsernameSchemaInterface extends Document {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isVerified: boolean;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isAcceptingMessages: boolean;
  provider: "credentials" | "google";
  uploads: Types.ObjectId[];
  isPasswordCorrect(password: string): Promise<boolean>;
}

export const UserSchema: Schema<UsernameSchemaInterface> =
  new Schema<UsernameSchemaInterface>({
    provider: {
      type: String,
      default: "credentials",
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      required: [true, `Please provide username`],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, `Please provide email`],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        `Please provide valid email address`,
      ],
    },
    password: {
      type: String,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyCode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, `Please provide a valid verify code`],
    },
    verifyCodeExpiry: {
      type: Date,
    },
    isAcceptingMessages: {
      type: Boolean,
      default: true,
    },
    uploads: [
      {
        type: Schema.Types.ObjectId,
        ref: "uploads",
      },
    ],
  });

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  user.password = await bcrypt.hash(user.password, 10);
  next();
});

UserSchema.pre("validate", function (next) {
  if (this.provider === "credentials") {
    if (!this.password) {
      this.invalidate("password", "Please provide password");
    }

    if (!this.verifyCode) {
      this.invalidate("verifyCode", "Please provide a verify code");
    }

    if (!this.verifyCodeExpiry) {
      this.invalidate(
        "verifyCodeExpiry",
        "Please provide a verify code expiry"
      );
    }
  }
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const UserModel =
  (models.users as Model<UsernameSchemaInterface>) ||
  model<UsernameSchemaInterface>("users", UserSchema);

export default UserModel;
