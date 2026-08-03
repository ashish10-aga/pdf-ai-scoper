# Security Policy

## Supported Versions

The following versions of PDF AI Scoper currently receive security updates.

| Version | Supported |
| ------- | --------- |
| Latest (main) | ✅ |
| Older releases | ❌ |

---

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not create a public GitHub issue**.

Instead, report it privately by contacting:

- Email: your-email@example.com

Please include:

- A description of the vulnerability
- Steps to reproduce it
- Potential impact
- Proof of concept (if available)

You can expect an acknowledgement within **48 hours**, with regular updates until the issue is resolved.

---

## Security Considerations

### PDF Processing

PDF AI Scoper processes documents provided by the user.

Users should avoid uploading confidential, classified, or highly sensitive documents unless they understand the risks associated with transmitting data to third-party AI providers.

---

### AI Processing

This application may send document content to an external AI inference provider (such as Groq) to generate summaries, answer questions, or create narration.

The handling of transmitted data is subject to the provider's own privacy and security policies.

---

### API Keys

API keys should never be committed to the repository.

Developers should:

- Store secrets using environment variables.
- Rotate compromised credentials immediately.
- Never expose server-side secrets in client-side code.

---

### Prompt Injection

Uploaded PDFs may contain malicious instructions intended to manipulate AI model behavior.

Although the application attempts to limit these risks, AI responses should always be reviewed before being trusted for important decisions.

---

### AI Accuracy

Large Language Models may generate incorrect, incomplete, or fabricated information.

Users should independently verify AI-generated summaries and answers before relying on them.

---

### Browser Permissions

Speech recognition and speech synthesis depend on browser APIs.

Users should grant microphone permissions only when necessary and ensure they trust the environment in which the application is running.

---

## Dependency Security

To maintain security:

- Keep dependencies up to date.
- Monitor GitHub Dependabot alerts.
- Regularly run security audits using:

```bash
npm audit
```

or

```bash
npm audit fix
```

---

## Responsible Disclosure

We appreciate responsible security research.

Please allow reasonable time for vulnerabilities to be investigated and resolved before making any public disclosure.

Researchers who responsibly disclose valid vulnerabilities may be acknowledged in future releases, with their permission.

---

Thank you for helping make PDF AI Scoper more secure.
