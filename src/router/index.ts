import { Router } from "express";
import companies from "./companies";
import initialize from "./initialize";
import assistant from "./assistant";

const router = Router();

export default (): Router => {
  companies(router);
  initialize(router);
  assistant(router);
  return router;
};
