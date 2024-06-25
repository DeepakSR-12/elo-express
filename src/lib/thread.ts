import OpenAI from "openai";
import {
  MessageContent,
  TextContentBlock,
} from "openai/resources/beta/threads/messages";
import { setTimeout } from "timers/promises";

export async function createFile(openai: OpenAI, file: File) {
  const createdFile = await openai.files.create({
    file,
    purpose: "assistants",
  });

  return createdFile?.id;
}

export async function createVectorStore(
  openai: OpenAI,
  fileIds: string[],
  companyName: string
) {
  const response = await openai.beta.vectorStores.create({
    file_ids: fileIds,
    name: `Vector store for ${companyName}-gpt`,
  });

  return response?.id;
}

export async function createJsonAssistant(
  openai: OpenAI,
  companyName: string,
  vectorId: string
) {
  const myAssistant = await openai.beta.assistants.create({
    model: "gpt-3.5-turbo",
    instructions: `Read and analyze the file and return response using the calling function "get_earnings_report"`,
    name: `${companyName}-gpt`,
    tools: [
      {
        type: "function",
        function: {
          name: "get_earnings_report",
          description: "Retrieve earnings report details for a company",
          parameters: {
            type: "object",
            properties: {
              company_name: {
                type: "string",
                description: "The name of the company; e.g., 'Apple Inc.'",
              },
              revenue: {
                type: "string",
                description:
                  "The total revenue of the company for the reporting period; e.g., '$100 million'",
              },
              earnings_per_share: {
                type: "string",
                description:
                  "Earnings per share (EPS) for the reporting period; e.g., '$5.40'",
              },
              gross_margin: {
                type: "string",
                description:
                  "Gross margin percentage for the reporting period; e.g., '$50 million'",
              },
              operating_income: {
                type: "string",
                description:
                  "Operating income for the reporting period; e.g., '$50 million'",
              },
              net_income: {
                type: "string",
                description:
                  "Net income for the reporting period; e.g., '$50 million'",
              },
              free_cash_flow: {
                type: "string",
                description:
                  "Free cash flow for the reporting period; e.g., '$50 million'",
              },
              capital_expenditures: {
                type: "string",
                description:
                  "Capital expenditures for the reporting period; e.g., '$50 million'",
              },
              effective_tax_rate: {
                type: "string",
                description:
                  "Effective tax rate for the reporting period; e.g., '50%'",
              },
              number_of_employees: {
                type: "string",
                description:
                  "Total number of employees; e.g., '10000 employees'",
              },
              headcount_change: {
                type: "string",
                description: "Percentage change in headcount; e.g., '10%'",
              },
              operating_expenses: {
                type: "string",
                description:
                  "Total operating expenses for the reporting period; e.g., '$50 million'",
              },
              stock_based_compensation_impact: {
                type: "string",
                description:
                  "Impact of stock-based compensation on financials; e.g., '$595 million for the quarter'",
              },
              gross_margin_percentage: {
                type: "string",
                description:
                  "Gross margin percentage for the company; e.g., '50%'",
              },
            },
            required: [
              "company_name",
              "revenue",
              "earnings_per_share",
              "gross_margin",
              "operating_income",
              "net_income",
              "free_cash_flow",
              "capital_expenditures",
              "effective_tax_rate",
              "number_of_employees",
              "headcount_change",
              "operating_expenses",
              "stock_based_compensation_impact",
              "gross_margin_percentage",
            ],
          },
        },
      },
      { type: "file_search" },
    ],
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorId],
      },
    },
  });

  return myAssistant.id;
}

export async function createEmptyThread(openai: OpenAI) {
  const emptyThread = await openai.beta.threads.create();

  return emptyThread;
}

export async function fetchMessageFromAssistant(
  openai: OpenAI,
  threadId: string,
  assistantId: string,
  userMessage: string
): Promise<MessageContent[] | string> {
  try {
    if (userMessage) {
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: `${userMessage}`,
      });

      await setTimeout(1000);

      let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
      });

      let jsonOutput: string = "";

      const retrieveRun = async (thisRun: OpenAI.Beta.Threads.Runs.Run) => {
        while (true) {
          let currentRun = await openai.beta.threads.runs.retrieve(
            threadId,
            thisRun.id
          );

          if (currentRun.status == "requires_action") {
            const toolCall =
              currentRun.required_action?.submit_tool_outputs.tool_calls[0];

            jsonOutput = JSON.stringify(toolCall?.function.arguments);

            currentRun =
              await openai.beta.threads.runs.submitToolOutputsAndPoll(
                threadId,
                currentRun.id,
                {
                  tool_outputs: [
                    {
                      tool_call_id: toolCall?.id,
                      output: jsonOutput,
                    },
                  ],
                }
              );
          } else if (currentRun.status === "completed") {
            const allMessages = await openai.beta.threads.messages.list(
              threadId
            );

            const assistantMessage = allMessages.data.find(
              (message) => message.role === "assistant"
            );

            const message = (assistantMessage?.content[0] as TextContentBlock)
              .text.value;

            if (assistantMessage) {
              const output = !!jsonOutput ? jsonOutput : message;
              return output;
            } else {
              throw new Error("Assistant message not found.");
            }
          } else if (
            currentRun.status === "queued" ||
            currentRun.status === "in_progress"
          ) {
            // Wait for a while before checking again
            await setTimeout(3000);
          } else {
            throw new Error(`Unexpected run status: ${currentRun.status}`);
          }
        }
      };

      return await retrieveRun(run);
    } else {
      throw new Error("User message is required");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
}
