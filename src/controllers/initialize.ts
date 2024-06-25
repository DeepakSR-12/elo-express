import { Request, Response } from "express";
import {
  createEmptyThread,
  createFile,
  createJsonAssistant,
  createVectorStore,
  fetchMessageFromAssistant,
} from "../lib/thread";
import { CompanyData } from "../lib/constants";
import { TextContentBlock } from "openai/resources/beta/threads/messages";
import { client } from "../index";
import { addCompany } from "../db/companies";

export const initializeCompany = async (req: Request, res: Response) => {
  try {
    const companyName = req.body.companyName;
    const earningReport = req.file;

    if (!companyName) {
      return res.status(400).json({ message: "companyName is required" });
    }

    if (!earningReport) {
      return res.status(400).json({ message: "earningReport is required" });
    }

    const file = new File([earningReport.buffer], earningReport.originalname, {
      type: earningReport.mimetype,
    });

    const fileId = await createFile(client, file);

    const vectorId = await createVectorStore(client, [fileId], companyName);

    if (vectorId && fileId) {
      const assistantId = await createJsonAssistant(
        client,
        companyName,
        vectorId
      );

      const thread = await createEmptyThread(client);

      if (thread?.id && assistantId) {
        const messages = await fetchMessageFromAssistant(
          client,
          thread?.id,
          assistantId,
          "Retrieve earnings report details for a company in JSON; RETURN RESULT ONLY IN JSON"
        );

        const parsedMessage =
          typeof messages === "string"
            ? JSON.parse(JSON.parse(messages))
            : JSON.parse((messages[0] as TextContentBlock).text.value);

        const companyPayload: CompanyData = {
          assistantId,
          companyName,
          earningsReport: parsedMessage,
        };

        await addCompany(companyPayload);

        return res.status(200).json({ message: "Assistance is created" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
