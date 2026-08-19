# Implementation Plan

## Admin‑First User Management Redesign

We will overhaul the authentication / user‑management flow to meet the new requirements:
1. **Initial hard‑coded admin account** (`admin / password`).
2. **Admin‑only panel** to create, edit and delete users.  This panel will be hidden for non‑admin users.
3. **Signup form** will no longer expose a role dropdown – the role field becomes a free‑text optional input and is completely hidden when the admin creates a user (the admin can set any role manually).
4. **Registered users** continue to be persisted in `localStorage` under `agenticRegisteredUsers` – now the admin can add users via the panel, and normal sign‑ups will only capture name, email, password (role optional).
5. **Admin account** will never appear in the public user list or chat roster.
6. **Chat UI changes**:
   - Remove the exact‑search feature.
   - Move the “Groups” section to the top of the sidebar (above the chat list) and ensure newly created groups appear at the top.
   - Add a `+` button in the sidebar header to create a new group. The button opens a modal where the admin can type a group name and select members from the user list.
   - In each chat view, a `+` button allows adding more participants to a group.
   - The existing search bar (Agentic Search) is restored above the chat list.
7. **Local development** – we will provide a small npm script (`npm run dev`) that starts a local dev server (via Vite) so you can test locally before deploying.

## User Review Required

[!IMPORTANT]
- **Admin credentials**: We will use `admin` / `password` (as you confirmed). If you need different credentials, let us know now.
- **Admin UI location**: The admin panel will be reachable via a new top‑right “Admin” button that appears only for the admin after login. Confirm if this placement works for you.
- **Group creation flow**: We will use a modal triggered by a `+` button in the sidebar header. Confirm if you prefer a separate page instead.
- **Role field**: Will be a free‑text optional input, hidden for the admin. Confirm that this satisfies your “optional over there” requirement.

## Open Questions

[!WARNING]
- Should the admin be allowed to edit the default admin account (e.g., change its password) after creation?
- Do you want any additional validation on the free‑text role field (e.g., length limit) or should it accept any string?
- Are there any other user fields you want to expose in the admin panel (e.g., avatar, department)?

## Proposed Changes

---
### Front‑end (React) – `app.jsx`
- Add a hard‑coded admin fallback if `localStorage` is empty.
- Introduce a new component **AdminPanel** with user list, add‑user form, and delete functionality.
- Guard the Admin button and panel visibility based on `loggedInUser.employeeId === 'admin'`.
- Refactor signup component:
  * Remove role dropdown.
  * Replace with `<input type="text" placeholder="Role (optional)" ...>` that is hidden when `loggedInUser?.employeeId === 'admin'`.
- Update user registration logic to push new users into `registeredUsers` via the admin panel instead of the public signup form.
- Adjust `useEffect` that loads/saves `registeredUsers` to always keep the admin account present.
- Remove exact‑search UI component from the chat sidebar.
- Re‑order sidebar sections: **Groups (+ button)** → **Search bar** → **Chats list**.
- Implement **GroupCreateModal** with a name field and a multi‑select list of users.
- Add `+` button inside a chat view to open a **AddMembersModal**.
- Update CSS (`index.css`) for new layout, modal styling, and hide admin‑only elements.

---
### CSS – `index.css`
- Add styles for the admin panel, modals, and the relocated groups section.
- Ensure the `+` button has a distinct accent color and hover effect.
- Remove any selectors related to exact‑search.

---
### Dev Server
- Add a `package.json` with Vite dev dependencies if not present.
- Provide `npm run dev` script that serves the app on `localhost:5173`.

---
### Deployment
- The existing Vercel deployment workflow remains unchanged; after local testing you can run the same Vercel deploy command.

## Verification Plan

### Automated Tests
- Run the existing React build (`npm run build`) to ensure no syntax errors.
- Execute a simple Jest test (if present) to verify that `registeredUsers` always contains the admin after initialization.

### Manual Verification
- Start the dev server (`npm run dev`).
- Verify that on first load the admin login works with `admin / password`.
- Confirm the Admin button appears only for the admin and allows adding a new user.
- Check that the signup form no longer shows a role dropdown and that the role field is optional.
- Ensure groups appear at the top of the sidebar and the `+` button opens the modal.
- Create a group, add members, and see the group listed correctly.
- Verify the exact‑search component is gone.
- Deploy to Vercel and test the same flows on the live site.

---
*All changes will be made inside the existing `enterprise-repo-dashboard` workspace; no files outside that directory will be modified.*
