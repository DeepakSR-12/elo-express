import { Router } from "express";
import companies from "./companies";

const router = Router();

export default (): Router => {
  companies(router);
  return router;
};
