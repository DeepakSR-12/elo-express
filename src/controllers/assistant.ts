import { client } from "../index";
import { Request, Response } from "express";
import { updateCompany } from "../db/companies";
import { createEmptyThread, fetchMessageFromAssistant } from "../lib/thread";

export const askAssistant = async (req: Request, res: Response) => {
  try {
    const { message, assistantId, type, companyName } = req.body;

    if (!message) {
      return res.send(400).json({ message: "Prompt is required" });
    }

    const thread = await createEmptyThread(client);

    const response = await fetchMessageFromAssistant(
      client,
      thread?.id,
      assistantId,
      message
    );

    if (
      !!response &&
      typeof response == "string" &&
      (type === "summary" || type === "sentiment")
    ) {
      await updateCompany(companyName, type, response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
