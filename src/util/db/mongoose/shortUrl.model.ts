import { Model, Mongoose } from "mongoose";

export const shortUrlModel = async (mongoose: Mongoose): Promise<any> => {
  const modelName = "ShortUrl"

  const collectionExists = await mongoose.connection.db.listCollections({ name: modelName }).hasNext();
  if (!collectionExists) {
    await mongoose.connection.createCollection(modelName);
    console.log("Created 'shorturls' collection");
  }

  const urlSchema = new mongoose.Schema({
    original_url: {
      type: String,
      required: true,
      unique: true,
    },
    short_url: {
      type: Number,
      required: true,
      unique: true,
    }
  });
  
  const model = mongoose.model(modelName, urlSchema, modelName);
  return model
}
