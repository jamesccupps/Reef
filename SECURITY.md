# Security policy

## Reporting a vulnerability

Please report security problems privately, through GitHub's private vulnerability reporting: open the repository's **Security** tab and choose **Report a vulnerability**. Don't open a public issue for them.

Include what you found, where it is (the file, or the page and its URL), and the steps that show it. This is a one-person project, so replies are best effort. A confirmed problem is fixed on `main`.

## What is in scope

Synapse Reef runs entirely in the browser. It has no server-side code, accounts or stored user data. The parts where a security problem could matter:

- **The published pages** on GitHub Pages: the 2-D lake (`index.html`), the 3-D lakes (`w3.html`) and the paper (`paper/`). Each page sets a strict Content-Security-Policy, with no inline scripts.
- **Imported save files.** The 2-D page treats a save as untrusted input: every field is type-checked and bounded before anything in the running lake changes.
- **The two development servers** (`serve.mjs` and `serve.py`). They listen on localhost only, check the Host header, and refuse directory listings, dotfiles and paths outside the project.

## What is out of scope

- The simulation's ecology: wrong numbers or behavior are ordinary bugs, so please open an issue for those.
- Third-party services the pages load from (Google Fonts), and GitHub itself.
- Copies of the project that have been modified, or that are served by something other than its own servers or GitHub Pages.

## Supported versions

Only the current `main` branch and the live site are supported.
