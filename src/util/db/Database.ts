require("dotenv").config()
const mongoose = require("mongoose")
import { shortUrlModel } from "./mongoose/shortUrl.model"

type ShortUrl = {
  original_url?: string
  short_url?: Number
}
export class Database {
  public models: any
  private mongoose: any
  private defaultModel: any

  constructor() {
    this.mongoose = mongoose
  }
  public readonly connect = async (): Promise<any | Error> => {
    try {
      const dbUri = process.env.DB_URI
      if (!dbUri) { throw new Error("DB_URI env is not properly set.") }

      await this.mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })

      this.models = {
        ShortUrlModel: await shortUrlModel(this.mongoose)
      }
      this.defaultModel = this.models.ShortUrlModel
    } catch (e) {
      console.error("Error connecting to database:", e);
    }
  }

  public readonly disconnect = async (): Promise<void> => {
    await this.mongoose.disconnect()
  }

  public readonly createDocument = async (content: ShortUrl, modelName?: string): Promise<void | Error> => {
    const Model = this.getModel(modelName)

    try {
      const existingDocument = await Model.findOne(content).select("-_id").exec()
      if (existingDocument) {
        return existingDocument
      }

      const allShortUrls = await Model.find({}).select("-_id -original_url").exec()

      let short_url: number = 0
      await Promise.all(
        allShortUrls.map((elem: any, index: Number) => {
          const short_urlExists = allShortUrls.forEach((elem: any, index: number) => {
            if (elem.short_url === short_url) {
              short_url = index + 1
            }
          })
          if (short_urlExists) {
          }
        })
      )

      console.log(content.original_url, short_url)

      content.short_url = short_url
      const document = new Model(content)
      document.save()
      return document
    } catch (e: any) {
      throw new Error(e)
    }
  }

  public readonly getDocumentByShortUrl = async (content: ShortUrl, modelName?: string): Promise< any | Error> => {
    const Model = this.getModel(modelName)

    try {
      const document = Model.findOne(content)
      if(!document){
        throw new Error("Short Url Doesn't exist")
      }
      return document

    } catch (e: any) {
      throw e
    }
  }

  private getModel = (modelName?: string): any => {
    if (modelName) {
      const model = this.models[modelName]
      if (!model) throw new Error("Could not find model")
      return model()
    }
    return this.defaultModel
  }

  public readonly removeAllDocuments = async (modelName?: string): Promise<void> => {
    const Model = this.getModel(modelName)

    await Model.deleteMany({})
  }
}