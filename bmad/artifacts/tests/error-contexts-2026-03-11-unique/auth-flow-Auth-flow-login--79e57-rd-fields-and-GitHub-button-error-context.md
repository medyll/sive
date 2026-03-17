# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - heading "Sign in to Sive" [level=1] [ref=e5]
    - status [ref=e6]:
      - text: ⚠️ Dev mode — no database available. Auth is disabled.
      - link "Continue as guest →" [ref=e7] [cursor=pointer]:
        - /url: /app
    - generic [ref=e8]:
      - generic [ref=e9]: Email
      - textbox "Email" [ref=e10]
      - generic [ref=e11]: Password
      - textbox "Password" [ref=e12]
      - button "Sign in" [ref=e13] [cursor=pointer]
    - paragraph [ref=e14]:
      - text: No account?
      - link "Create one" [ref=e15] [cursor=pointer]:
        - /url: /auth/signup
```