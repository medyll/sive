<!-- 8-multi-user-administration-authentication.md -->

## 8. Multi-User Administration & Authentication

### 8.1 Deployment Model

| Criterion | Desktop *(recommended V1)* | Shared Server *(V2+)* |
|---|---|---|
| File isolation | OS directories per profile — trivial | Docker volumes per user |
| API keys | Stored locally, encrypted | Never in plaintext — vault required |
| Authentication | Simple local login or OAuth | OAuth + MFA recommended |
| AI privacy | Ollama 100% local possible | Cloud requests logged — to be documented |

### 8.2 Onboarding — Silent User Creation

Onboarding is designed to be as accessible as possible. No classic registration form. The user is guided by a minimal conversational sequence.

**Step 1 — Name**
Simple text field: *"What should we call you?"*. No strict validation — a first name, a pseudonym, anything goes. The account is silently created on confirmation.

**Step 2 — Security (optional)**
*"Do you want to protect your space?"* Three options presented equally:
- No password *(direct access, recommended for solo use)*
- Password *(simple field, confirmation)*
- Connect via an existing account *(OAuth)*

**Step 3 — OAuth (if chosen)**
Provider selection from those available. The list is extensible.

### 8.3 Supported Authentication Methods

| Method | Description | Availability |
|---|---|---|
| None | Direct access without password | V1 |
| Local password | bcrypt hash, stored locally | V1 |
| Google OAuth | Sign in with Google account | V1 |
| GitHub OAuth | Sign in with GitHub account | V1 |
| Apple Sign In | Sign in with Apple ID | V1 |
| Discord OAuth | Sign in with Discord | V2 |
| Microsoft OAuth | Sign in with Microsoft account | V2 |

### 8.4 Total Isolation

Each user has personal directories with independent configurations, style profiles, version histories and their own API keys.

### 8.5 Censorship Mode — Beta Reader Export

Manuscript export with automatic masking of spoilers or YAML notes marked as confidential. Mechanism based on explicit tags in the source text:

```
{{spoiler}} masked content {{/spoiler}}
```

Replaced by blanks or neutral placeholders on export. Works on continuous narrative text, not only on structured fields.
