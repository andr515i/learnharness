import React from "react";
(globalThis as Record<string, unknown>).React = React;
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import assert from "node:assert/strict";
import { ApplicationDock } from "../components/application-dock.tsx";

test("application dock presents the task, vertical response options and saved-file input", () => {
	const html = renderToStaticMarkup(<ApplicationDock input={{ statement: "Count the hits." }} disabled={false} onSubmit={() => {}} />);
	for (const text of ["Count the hits.", "give me feedback", "Give me a hint", "I have a question", "I don’t know", "Saved file path", "Skip task"]) assert.ok(html.includes(text), text);
	assert.match(html, /space-y-2/);
});
