import { CompanyData } from "lib/constants";
import mongoose, { Document, Schema } from "mongoose";

interface IEarningsReport {
  capital_expenditures: string;
  company_name: string;
  earnings_per_share: string;
  effective_tax_rate: string;
  free_cash_flow: string;
  gross_margin: string;
  gross_margin_percentage: string;
  headcount_change: string;
  net_income: string;
  number_of_employees: string;
  operating_expenses: string;
  operating_income: string;
  revenue: string;
  stock_based_compensation_impact: string;
}

export interface ICompany extends Document {
  assistantId: string;
  companyName: string;
  earningsReport: IEarningsReport;
  sentiment?: string;
  summary?: string;
}

const earningsReportSchema = new Schema<IEarningsReport>({
  capital_expenditures: { type: String, required: true },
  company_name: { type: String, required: true },
  earnings_per_share: { type: String, required: true },
  effective_tax_rate: { type: String, required: true },
  free_cash_flow: { type: String, required: true },
  gross_margin: { type: String, required: true },
  gross_margin_percentage: { type: String, required: true },
  headcount_change: { type: String, required: true },
  net_income: { type: String, required: true },
  number_of_employees: { type: String, required: true },
  operating_expenses: { type: String, required: true },
  operating_income: { type: String, required: true },
  revenue: { type: String, required: true },
  stock_based_compensation_impact: { type: String, required: true },
});

const companySchema = new Schema<ICompany>({
  assistantId: { type: String, required: true },
  companyName: { type: String, required: true },
  earningsReport: { type: earningsReportSchema, required: true },
  sentiment: { type: String, required: false },
  summary: { type: String, required: false },
});

export const CompanyModel = mongoose.model<ICompany>("Company", companySchema);

export const getCompaniesData = (): Promise<ICompany[]> =>
  CompanyModel.find().exec();

export const addCompany = (companyData: CompanyData): Promise<ICompany> =>
  CompanyModel.create(companyData);

export const updateCompany = (
  companyName: string,
  field: string,
  value: string
): Promise<any> => {
  const update = { [field]: value };
  return CompanyModel.updateOne({ companyName }, update).exec();
};
