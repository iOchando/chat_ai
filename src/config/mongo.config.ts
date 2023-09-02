import { connect } from "mongoose";

async function dbConnect(): Promise<void> {
  await connect(<string>process.env.MONGODB_URL);
}

export default dbConnect;
