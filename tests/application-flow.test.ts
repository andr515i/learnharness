import assert from "node:assert/strict";
import { test } from "node:test";
import { activeApplicationOf, APPLICATION_SKIP_TEXT, needsContinuation, newUserMessage, type LhMessage } from "../src/core/native-messages.ts";
import { applicationTools } from "../src/agent/tools/application.ts";
import type { PlanToolContext } from "../src/agent/tools/plan.ts";

const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } };
function call(name: string, id: string, isError = false): LhMessage[] {
	return [
		{ id: `a-${id}`, role: "assistant", content: [{ type: "toolCall", id, name, arguments: { statement: "Write a loop" } }], api: "faux", provider: "test", model: "test", usage, stopReason: "toolUse", timestamp: 1 },
		{ id: `r-${id}`, role: "toolResult", toolCallId: id, toolName: name, content: [{ type: "text", text: "ack" }], details: null, isError, timestamp: 2 },
	] as LhMessage[];
}

test("application stays active through learner questions and reload; completion or skip releases it", () => {
	const pose = call("application", "pose");
	assert.equal(activeApplicationOf(pose)?.toolCallId, "pose");
	assert.equal(needsContinuation(pose), false);
	assert.equal(activeApplicationOf([...pose, newUserMessage("Can I use a loop?")])?.toolCallId, "pose");
	assert.equal(activeApplicationOf([...pose, ...call("application_complete", "bad", true)])?.toolCallId, "pose");
	assert.equal(activeApplicationOf([...pose, ...call("application_complete", "done")]), null);
	assert.equal(activeApplicationOf([...pose, newUserMessage(APPLICATION_SKIP_TEXT)]), null);
	assert.equal(activeApplicationOf(call("application", "bad-pose", true)), null);
});

test("application tools enforce one active task and stop after posing", async () => {
	const ctx = { chatId: "test", chatStore: { getChat: () => ({ messages: [] }) } } as unknown as PlanToolContext;
	const tools = applicationTools(ctx);
	assert.equal((await tools.application_complete!.execute("empty", {})).isError, true);
	assert.equal((await tools.application!.execute("pose", { statement: "Write a loop" })).terminate, true);
	assert.equal((await tools.application!.execute("again", { statement: "Another" })).isError, true);
	assert.equal((await tools.application_complete!.execute("done", {})).isError, undefined);
});
