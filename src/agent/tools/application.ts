import { Type } from "typebox";
import type { AgentTool } from "@earendil-works/pi-agent-core";
import { activeApplicationOf } from "../../core/native-messages.ts";
import { invalidInputResult } from "../tool-execute.ts";
import type { PlanToolContext } from "./plan.ts";

const taskInput = Type.Object({
	statement: Type.String({ minLength: 1, description: "The practical task and what the learner should produce." }),
});
const completeInput = Type.Object({});

export function applicationTools(ctx: PlanToolContext): Record<string, AgentTool<any>> {
	let active = activeApplicationOf(ctx.chatStore.getChat(ctx.chatId)?.messages ?? []) !== null;
	return {
		application: {
			name: "application", label: "application", parameters: taskInput, executionMode: "sequential",
			description: "Present one practical application task. Ends the turn while the learner works. The learner can ask questions, request help, submit evidence or skip. Only one task can be active.",
			execute: async () => {
				if (active) return invalidInputResult("application", ["An application task is already active."]);
				active = true;
				return { content: [{ type: "text", text: "Application task posed. Wait for the learner's next message." }], details: null, terminate: true };
			},
		},
		application_complete: {
			name: "application_complete", label: "application_complete", parameters: completeInput, executionMode: "sequential",
			description: "Close the active application task when the learner's result and reasoning are sufficient. Then continue teaching. Do not close it merely because the learner asked a question or requested help.",
			execute: async () => {
				if (!active) return invalidInputResult("application_complete", ["No application task is active."]);
				active = false;
				return { content: [{ type: "text", text: "Application task complete. Continue the lesson." }], details: null };
			},
		},
	};
}
