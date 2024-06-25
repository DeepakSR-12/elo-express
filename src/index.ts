import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import router from "./router";
import OpenAI from "openai";
require("dotenv").config();

export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

app.use(cors());

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = createServer(app);

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});

const MONGO_URL = process.env.MONGO_URL || "";

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error) => console.log(error));

app.use("/", router());
