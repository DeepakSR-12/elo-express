import multer from "multer";
import { initializeCompany } from "../controllers/initialize";
import { Router } from "express";

const upload = multer({ storage: multer.memoryStorage() });
export default (router: Router) => {
  router.post("/initialize", upload.single("earningReport"), initializeCompany);
};
