import { Request, Response } from "express";
import { CompanyModel, getCompaniesData } from "../db/companies";

export const retrieveCompaniesData = async (_req: Request, res: Response) => {
  try {
    const companies = await getCompaniesData();
    return res.status(200).json(companies);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addCompany = async (req: Request, res: Response) => {
  const companyData = req.body;
  try {
    const existingCompany = await CompanyModel.findOne({
      companyName: companyData.companyName,
    });

    if (existingCompany) {
      console.log("Company already exists");
      return res.status(409).json({ message: "Company already exists" });
    }

    const newCompany = new CompanyModel(companyData);
    await newCompany.save();

    return res.status(200).json({ message: "Company added successfully" });
  } catch (error) {
    console.error("Error adding company: ", error);
    return res.status(500).json({ message: "Error adding company" });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  const { companyName, field, value } = req.body;
  try {
    const existingCompany = await CompanyModel.findOne({ companyName });

    if (!existingCompany) {
      console.log("Company does not exist");
      return res.status(404).json({ message: "Company does not exist" });
    }

    existingCompany.set(field, value);
    await existingCompany.save();

    return res.status(200).json({ message: "Company updated successfully" });
  } catch (error) {
    console.error("Error updating company: ", error);
    return res.status(500).json({ message: "Error updating company" });
  }
};
