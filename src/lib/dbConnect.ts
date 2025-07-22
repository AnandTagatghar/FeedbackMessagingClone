import { databaseName } from "@/utils/constants";
import { connect } from "mongoose";

type isConnectionObjType = {
  isConnected?: number;
};

const isConnectionObj: isConnectionObjType = {};

export default async function dbConnect() {
  try {
    if (isConnectionObj.isConnected) {
      console.log(`DB connection is already connected`);
      return;
    }

    const connection = await connect(
      `${process.env.MONGODB_URI}/${databaseName}`
    );

    isConnectionObj.isConnected = connection.connections[0].readyState;

    console.log(`DB connection success`);
  } catch (error: any) {
    console.error(`DB connection failed: ${error.message} `);
    process.exit(1);
  }
}
