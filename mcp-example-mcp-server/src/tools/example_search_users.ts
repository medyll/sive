import { z } from "zod";

export const UserSearchInputSchema = z.object({
  query: z.string().min(2).max(200).describe("Search string"),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  response_format: z.enum(["markdown", "json"]).default("markdown")
}).strict();

export type UserSearchInput = z.infer<typeof UserSearchInputSchema>;

export async function registerTools(server: any) {
  server.registerTool(
    "example_search_users",
    {
      title: "Search Example Users",
      description: "Search users in the Example system by name or email.",
      inputSchema: UserSearchInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async (params: UserSearchInput) => {
      // Placeholder implementation: return empty results
      const output = { total: 0, count: 0, offset: params.offset, users: [], has_more: false };
      return {
        content: [{ type: "text", text: "No users (scaffold)" }],
        structuredContent: output
      };
    }
  );
}
