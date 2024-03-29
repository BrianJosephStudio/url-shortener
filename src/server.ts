require("dotenv").config()
import { Request, Response } from "express"
import { Database } from "./util/db/Database"
const express = require("express")
const cors = require("cors")
const app = express()
const bodyParser = require("body-parser")

const startServer = async () => {
    const database = new Database()
    await database.connect()

    app.use(cors())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())


    app.get("/api/shorturl", (req: Request, res: Response) => {

    })

    app.post("/api/shorturl", async (req: Request, res: Response) => {
        try {
            const url = req.body.url
            console.log(req.body)

            console.log(url, "hits the endpoint")
            if (
                !/^(https?:\/\/)?(www\.)?\w+(\.|:)(com|\d+)/.test(url) ||
                !url ||
                typeof url !== "string"
            ) {
                return res.json({
                    error: "invalid url"
                })
            }

            const document = await database.createDocument({ original_url: url, short_url: 0 })

            return res.json(document)
        } catch (e: any) {
            console.error
            res.json({ error: "Internal Server Error" })
        }
    })

    app.get("/api/shorturl/:short_url", async (req: Request, res: Response) => {
        try {
            console.log("get endpoint starts")
            const short_url = parseInt(req.params.short_url)
            if (Number.isNaN(short_url)) {
                return res.status(400).json({ error: "Short Url is not valid" })
            }

            const document = await database.getDocumentByShortUrl({
                short_url: short_url
            })

            if(!document){
                console.log("eh?")
                return res.json({ error: "Short Url does not exist"})
            }

            return res.redirect(document.original_url)


        } catch (e) {
            res.json({ error: "Internal Server Error" })
        }
    })

    const port = process.env.PORT
    app.listen(port, () => {
        console.clear()
        console.log(`Listening on port ${port}`)
    })
}
startServer()