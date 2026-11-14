# Security policy

LearnHarness stores API keys, sign-in tokens, chats, and learning records on your machine, and its agent reads files and fetches web content on your behalf. If you find a way to abuse any of that, please tell us privately so a fix can ship before the details are public.

## Reporting a vulnerability

**Do not open a public issue, pull request, or Discord post for a security problem.**

A private reporting channel for this fork has not yet been established. Do not send reports about QuanHarness to the original project’s maintainers. Contact the fork owner privately only after establishing a suitable private channel.

A useful report includes:

- the LearnHarness version and your OS;
- what an attacker can do and what they need first (a web page the agent reads, a file the learner opens, network access, and so on);
- steps to reproduce, or a proof of concept;
- any fix or mitigation you have in mind.

## What to expect

The fork does not currently make a response-time or disclosure commitment.

## Supported versions

No supported-release policy has been established for this fork.

## Scope

In scope:

- the desktop app (Electron shell, window, and IPC);
- the local API server, whether started by the desktop app or run from source;
- the agent and its tools, including prompt injection from web pages, PDFs, or other content that leads to reading, changing, or sending your data;
- rendered content such as demos, figures, and markdown;
- the update and release pipeline.

Out of scope:

- attacks that already require running code as your OS user;
- bugs in third-party model or service providers themselves (report those to the provider);
- automated scanner output without a demonstrated impact on LearnHarness.
