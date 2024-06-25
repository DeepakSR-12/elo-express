import { askAssistant } from "../controllers/assistant";
import { Router } from "express";

export default (router: Router) => {
  router.post("/assistant", askAssistant);
};
