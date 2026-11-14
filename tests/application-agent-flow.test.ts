import assert from "node:assert/strict";
import { test } from "node:test";
import { createFauxCore, fauxAssistantMessage, fauxText, fauxToolCall } from "@earendil-works/pi-ai";
import { createTeacherAgent } from "../src/agent/teacher-agent.ts";
import { handleChatRequest } from "../src/server/chat-handler.ts";
import { runningTurn } from "../src/server/turn-runs.ts";
import { chatStore } from "../src/store/chats.ts";
import { jobStore } from "../src/store/jobs.ts";
import { activeApplicationOf, needsContinuation } from "../src/core/native-messages.ts";

process.env.OPENROUTER_API_KEY ??= "test-key-presence-gate";

test("teacher poses, answers a question, then completes an application", async () => {
	const chat = chatStore.createChat("Application flow test");
	chatStore.saveSettings(chat.id, { model: { provider: "openrouter", id: "z-ai/glm-5.3-flash" } });
	const faux = createFauxCore({});
	faux.setResponses([
		fauxAssistantMessage([fauxToolCall("application", { statement: "Write a loop." }, { id: "pose" })], { stopReason: "toolUse" }),
		fauxAssistantMessage([fauxText("A loop visits each element.")]),
		fauxAssistantMessage([fauxToolCall("application_complete", {}, { id: "complete" })], { stopReason: "toolUse" }),
		fauxAssistantMessage([fauxText("Let's continue.")]),
	]);
	const engine = { model: faux.getModel(), streamFn: faux.streamSimple };
	const factory: Parameters<typeof handleChatRequest>[1] = opts => createTeacherAgent({ chatId: chat.id, chatStore, jobStore, spawn: () => {} }, { engine, messages: opts.messages });
	const send = async (text: string) => {
		const response = await handleChatRequest(new Request("http://test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId: chat.id, input: { type: "text", text } }) }), factory);
		assert.equal(response.status, 200);
		const running = runningTurn(chat.id);
		if (running) await new Response(running.subscribe()).text();
	};
	try {
		await send("Start");
		assert.equal(activeApplicationOf(chatStore.getChat(chat.id)!.messages)?.toolCallId, "pose");
		assert.equal(needsContinuation(chatStore.getChat(chat.id)!.messages), false);
		await send("How does a loop work?");
		assert.equal(activeApplicationOf(chatStore.getChat(chat.id)!.messages)?.toolCallId, "pose");
		await send("Here is my completed loop and reasoning.");
		assert.equal(activeApplicationOf(chatStore.getChat(chat.id)!.messages), null);
	} finally {
		chatStore.deleteChat(chat.id);
	}
});
