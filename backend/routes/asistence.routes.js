import express from "express"
import { createAttendanceSession } from "../controllers/asistence.controller.js"

let RoutesAsistence = express.Router()


RoutesAsistence.post("/asistences", createAttendanceSession)

export default RoutesAsistence