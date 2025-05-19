import express from "express";
import { sendContactMail } from "../controllers/mailController.js";

const router = express.Router();

router.post("/contact", sendContactMail);

export default router;
