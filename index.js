import express from 'express'
import { config } from "dotenv"
import path from 'path'
import { initiateApp } from "./source/utilities/initiateApp.js"

config({ path: path.resolve('./configs/configs.env') })

const app = express()

initiateApp(app, express)

// TODO : apply CRONS to this project :