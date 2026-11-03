import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { expect, test } from "bun:test";
import { join } from "node:path";
import packageJson from "../package.json" with { type: "json" };

test("initialize returns the version from package.json", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["src/index.ts"],
    cwd: join(import.meta.dir, ".."),
    stderr: "pipe",
  });
  const client = new Client({ name: "gpt-history-mcp-test", version: "0.0.0" });
  try {
    await client.connect(transport);
    expect(client.getServerVersion()).toEqual({ name: "gpt-history-mcp", version: packageJson.version });
    const instructions = client.getInstructions() ?? "";
    expect(instructions).toContain("Fio");
    expect(instructions).toContain("untrusted data");
    expect(instructions).not.toContain("access_token");
    const { tools } = await client.listTools();
    const byName = Object.fromEntries(tools.map((tool) => [tool.name, tool.description ?? ""]));
    expect(byName.search_chatgpt_messages).toContain("untrusted data");
    expect(byName.get_chatgpt_chat).toContain("untrusted data");
  } finally {
    await client.close();
  }
});
