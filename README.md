# Oral Draw

A web-based oral presentation draw system for classroom use. Students sign up voluntarily before class starts, and a winner is picked automatically when the session deadline passes. Built with vanilla HTML/CSS/JS and Appwrite as the backend — no build step, no framework, just a single HTML file.

## How it works

1. The admin creates sessions in the admin panel with a date, subject, and deadline time
2. Students log in and sign up for upcoming sessions they're willing to present at
3. At the deadline, an Appwrite scheduled function runs, picks one volunteer at random, and marks the session as `picked`
4. If nobody signed up by the deadline, the session is marked as `failed` — the teacher picks manually on the class
5. The student who was picked last time is locked out of signing up for the very next session

## Features

- 🔐 Username/password authentication (no real emails needed)
- 📋 Session list with `open`, `picked`, `failed`, and `locked` states
- ✋ Volunteer signup and withdrawal before the deadline
- 🎲 Automatic random draw via a scheduled Appwrite Function
- 👥 Classmates screen showing each student's presentation count and last pick date
- ⚙️ Admin panel — create, edit, delete sessions; clear all data; reset presentation history
- 🌍 Hungarian, English, and German language support
- 📱 Mobile-friendly with a bottom navigation bar
- 👁 Preview mode — explore the full UI and experince without an account

## Project structure

```
oral-draw/
├── index.html          # Full frontend — single self-contained file
└── function/
    ├── src/
    │   └── main.js     # Appwrite scheduled function (the draw logic)
    └── package.json
```

---

## Setup

### Prerequisites

- An [Appwrite Cloud](https://cloud.appwrite.io) account (free tier is totally fine)
- A place to host a static HTML file (see [Hosting](#hosting) below)
- Node.js installed locally if you want to deploy the function via CLI

---

### 1. Create an Appwrite project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io) and create a new project
2. Note your **Project ID** — find it on the Overview page (not the URL, which may include a region prefix)

---

### 2. Register your hosting domain as a platform

Appwrite uses CORS to only allow requests from registered domains. Go to **Overview → Platforms → Add platform → Web** and add your hosting domain as the hostname (e.g. `your-app.netlify.app`). See [Hosting](#hosting) for what to put here.

> If you're testing locally, also add `localhost` as a separate platform entry.

---

### 3. Set up the database

Go to **Databases → Create database** and name it `oral-draw`.

#### `sessions` collection

Create a collection called `sessions` with these attributes:

| Attribute | Type | Required | Notes |
|---|---|---|---|
| `date` | Datetime | ✅ | The session date |
| `subject` | String (255) | ❌ | Topic of the class |
| `state` | Enum | ✅ | Values: `open`, `locked`, `picked`, `failed` |
| `deadline` | Datetime | ✅ | When the draw runs automatically |
| `volunteer_count` | Integer | ❌ | Default: `0` |
| `winner_id` | String (36) | ❌ | User ID of the picked student |
| `winner_name` | String (255) | ❌ | Display name of the winner |

**Permissions** (Settings tab of the collection):
- Read → `Any`
- Create, Update, Delete → `label:admin`

#### `signups` collection

Create a collection called `signups` with these attributes:

| Attribute | Type | Required |
|---|---|---|
| `session_id` | String (36) | ✅ |
| `user_id` | String (36) | ✅ |
| `user_name` | String (255) | ✅ |
| `signed_up_at` | Datetime | ✅ |

**Permissions:**
- Read → `Any`
- Create → `Users` (any logged-in user)
- Delete → handled in code per-document via `Permission.delete(Role.user(userId))`

**Index:** Go to the **Indexes** tab of `signups` and add an index:
- Name: `session_id_idx`
- Type: `Key`
- Attribute: `session_id`

---

### 4. Set up authentication

Go to **Auth → Settings** and make sure **Email/Password** is enabled.

#### Create student accounts

Go to **Auth → Users → Create user** for each student:
- **Email**: `firstname.lastname@yourapp.local` (we use fake domain, so students don't need to use their email)
- **Name**: Student's real display name — this is what shows in the volunteer list
- **Password**: A default password (e.g. `Welcome123`) — students can change it after first login

#### Make an account admin

Go to **Auth → Users** → click the teacher's account → **Labels** → add `admin`. The Admin panel button only appears for users with this label.

---

### 5. Configure the frontend

Open `index.html` and find these three lines near the top of the `<script>` block:

```js
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT  = 'YOUR_PROJECT_ID';
const DATABASE_ID       = 'YOUR_DATABASE_ID';
```

Replace the placeholder values with your actual Project ID and Database ID, then upload `index.html` to your hosting provider.

---

### 6. Deploy the scheduled function

The function lives in the `function/` folder. It runs on a schedule, checks for open sessions whose deadline has passed, and picks a random winner.

#### Step 1 — Create the function in Appwrite

Go to **Functions → Create function**:
- **Name**: `oral-draw-picker`
- **Runtime**: Node.js 21 or higher
- **Public**: Off (the function should only run on a schedule)
- **Schedule**: `*/5 * * * *` (checks every 5 minutes, picks winners within 5 minutes of the deadline)

#### Step 2 — Add environment variables

In the function's **Settings** tab, add:

| Key | Value |
|---|---|
| `APPWRITE_ENDPOINT` | `https://cloud.appwrite.io/v1` |
| `APPWRITE_PROJECT_ID` | Your Appwrite Project ID |
| `DATABASE_ID` | Your database ID |
| `APPWRITE_API_KEY` | See below |

#### Step 3 — Create an API key

Go to **Overview → API Keys → Create API key**:
- Name it `oral-draw-function`
- Enable these scopes: `databases.read`, `databases.write`, `rows.read`, `rows.write`
- Copy the key immediately — it won't be shown again — and paste it as `APPWRITE_API_KEY`

#### Step 4 — Deploy the code

**Option A — Appwrite CLI (recommended)**

Install the CLI and deploy directly from your machine:

```bash
npm install -g appwrite-cli
appwrite login
cd function
npm install
appwrite functions createDeployment \
  --functionId YOUR_FUNCTION_ID \
  --entrypoint src/main.js \
  --code .
```

Replace `YOUR_FUNCTION_ID` with the ID shown in Appwrite → Functions → your function.

**Option B — GitHub**

1. Push the `function/` folder to a GitHub repo
2. In Appwrite → Functions → your function → **Settings** → connect the GitHub repo
3. Set **Root directory** to `function/` and **Entrypoint** to `src/main.js`
4. Appwrite will auto-deploy whenever you push to the main branch

After deploying, go to **Settings → Redeploy** to make sure the latest environment variables are active.

#### Step 5 — Test the function

Go to **Functions → oral-draw-picker → Executions → Create execution** and click **Create**. Check the **Logs** tab — you should see:

```
Found 0 session(s) to process
```

For a full end-to-end test:
1. Create a session in the admin panel with a deadline set a few minutes in the past
2. Sign up as a volunteer for that session
3. Trigger a manual execution
4. The session should flip to `picked` with your name as the winner

---

## Hosting

The frontend is a single `index.html` file with zero dependencies. Any static file host works. After deploying, add your domain as a platform in Appwrite (see step 2).

### Netlify (free, recommended)

1. Go to [netlify.com](https://netlify.com) and sign up for free
2. Either drag and drop `index.html` onto the dashboard, or connect your GitHub repo for auto-deploy on every push
3. Your site will be at `your-site.netlify.app`
4. Add `your-site.netlify.app` as a platform in Appwrite

### GitHub Pages (free)

1. Push `index.html` to a GitHub repo (rename it to `index.html` if needed)
2. Go to repo **Settings → Pages → Source** → select `main` branch → root folder
3. Your site will be at `yourusername.github.io/your-repo`
4. Add `yourusername.github.io` as a platform in Appwrite

### Vercel (free)

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Vercel detects a static site and deploys automatically
3. Your site will be at `your-project.vercel.app`
4. Add `your-project.vercel.app` as a platform in Appwrite

### Replit (free, good for quick testing)

1. Go to [replit.com](https://replit.com) and create a new **HTML/CSS/JS** repl
2. Replace the default `index.html` with the project file
3. Click **Run** — your site will be live at `your-repl.replit.app`
4. Add `your-repl.replit.app` as a platform in Appwrite

### Custom domain / self-hosted

Upload `index.html` to your web server or static hosting provider and point your domain at it. Add your domain (e.g. `yourdomain.com`) as a platform in Appwrite.

> **Note:** If your site runs behind Cloudflare or another proxy, make sure it isn't blocking cross-origin requests to `cloud.appwrite.io`. You may need to add a Response Header Transform Rule to allow the CORS headers through.

---

## How login works

Students don't need a real email address. When they type their username (e.g. `kovacs.balazs`) and password, the frontend automatically constructs a full email before authenticating:

```
kovacs.balazs  →  kovacs.balazs@yourapp.local
```

This means you can use any fake domain when creating accounts in Appwrite — just be consistent. The default in this project is `@feleles.local`. You can change it by editing this line in `index.html`:

```js
const email = username.includes('@') ? username : username + '@feleles.local';
```

---

## Behind the scenes


---

## License
MIT
