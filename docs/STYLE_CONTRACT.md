# Style Contract — Studioaprile (v3)

This site is intentionally minimal and static.

## Hard rules
- HTML structure is stable.
- Forms must NOT be modified without backend review.
- Subscribe form is styled via CSS only.
- No JavaScript added for layout or styling.
- No inline styles.
- No visual components added without explicit intent.

## Subscribe form (locked)
- Action: `/api/subscribe`
- Method: `POST`
- Input names: `email`, `source`, `company`
- Backend: Cloudflare Worker + MailerSend
- Frontend: CSS-only styling
- HTML MUST NOT be changed by automated tools.

## Layout system (locked)
- Static pages use 3 columns: Header | Media | Text
- Records pages use 2 columns: Header | Content
- Content aligns from the top with the same top offset.
- Footer stays inside layout wrappers.

## Images (locked)
- Square images unless explicitly stated.
- Individual record images must not render above 1024px.
- Page media filenames are fixed and should be replaced in-place.

## Change policy
- Prefer small CSS changes.
- HTML changes require justification.
- Architecture changes require documentation update.
