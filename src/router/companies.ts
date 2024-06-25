import { Router } from "express";
import {
  addCompany,
  retrieveCompaniesData,
  updateCompany,
} from "../controllers/companies";

export default (router: Router) => {
  router.get("/companies", retrieveCompaniesData);
  router.post("/companies", addCompany);
  router.put("/companies", updateCompany);
};
