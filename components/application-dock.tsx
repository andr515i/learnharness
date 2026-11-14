"use client";

import { useState } from "react";
import { ToolContentResponse } from "@/components/ai-elements/message";
import { APPLICATION_SKIP_TEXT } from "@/src/core";

const actions = [
	["feedback", "I’m finished — give me feedback"],
	["partial", "I have partial work and need a push"],
	["hint", "Give me a hint"],
	["demonstration", "Show me the full implementation"],
	["question", "I have a question"],
	["unknown", "I don’t know"],
] as const;

export function ApplicationDock({ input, disabled, onSubmit }: {
	input: { statement?: unknown };
	disabled: boolean;
	onSubmit: (text: string) => void;
}) {
	const [action, setAction] = useState<(typeof actions)[number][0]>("feedback");
	const [path, setPath] = useState("");
	const [text, setText] = useState("");
	const label = actions.find(([id]) => id === action)![1];
	const needsFile = action === "feedback" || action === "partial";
	const submit = () => {
		if (disabled || (action === "question" && !text.trim())) return;
		const statement = typeof input.statement === "string" ? input.statement : "";
		const message = [`Application task: ${statement}`, `Request: ${label}`,
			needsFile && path.trim() ? `Saved file path: ${path.trim()}` : "",
			text.trim() ? `My question or reasoning: ${text.trim()}` : ""].filter(Boolean).join("\n\n");
		setText("");
		onSubmit(message);
	};
	return <div className="flex max-h-[60vh] flex-col font-ui text-sm" data-testid="application-dock">
		<div className="min-h-0 overflow-y-auto px-4 pt-4">
		<div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Application</div>
		<ToolContentResponse>{typeof input.statement === "string" ? input.statement : ""}</ToolContentResponse>
		<fieldset className="mt-4 space-y-2" disabled={disabled}>
			<legend className="mb-2 text-xs font-medium text-muted-foreground">What would you like to do?</legend>
			{actions.map(([id, title]) => <label key={id} className="flex cursor-pointer items-center gap-2">
				<input type="radio" name="application-action" checked={action === id} onChange={() => setAction(id)} /> {title}
			</label>)}
		</fieldset>
		{needsFile && <label className="mt-4 block text-xs text-muted-foreground">Saved file path (optional)
			<input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground" value={path} onChange={event => setPath(event.target.value)} placeholder="/path/to/saved/file" disabled={disabled} />
		</label>}
		<label className="mt-3 block text-xs text-muted-foreground">{action === "question" ? "Your question" : "Your thinking or question (optional)"}
			<textarea className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground" value={text} onChange={event => setText(event.target.value)} rows={3} disabled={disabled} />
		</label>
		</div>
		<div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
			<button type="button" className="text-xs text-muted-foreground hover:text-foreground" disabled={disabled} onClick={() => onSubmit(APPLICATION_SKIP_TEXT)}>Skip task</button>
			<button type="button" className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50" disabled={disabled || (action === "question" && !text.trim())} onClick={submit}>Send</button>
		</div>
	</div>;
}
