# Oral Draw — Preview

> **This is the `special` branch, the standalone, fully offline preview version of Oral Draw, built for demonstration purposes and for the competition. No login, no backend, no setup required. Just open the file.**

---

## What is this?

Oral Draw is a web-based oral presentation draw system for classroom use. Students sign up voluntarily before class starts, and a winner is picked automatically when the session deadline passes.

This branch contains a stripped-down, self-contained version of the app that runs entirely in the browser with no external dependencies. All data is local and resets on page refresh. It's meant to showcase the full UI and user experience without needing an Appwrite account or any configuration.

For the full production version with authentication, a real database, and the scheduled draw function, see the [`main` branch](https://github.com/QuaternionDev/oral-draw).

---

## How to run

Download `index.html` and open it in any browser. That's it.

No install, no server, no account.

---

## What you can do in the preview

- Browse upcoming and past sessions
- Sign up and withdraw as a volunteer
- View the classmates screen with presentation history
- Explore the admin panel — create, edit, and delete sessions
- Switch between Hungarian, English, and German
- See the picked and failed session states

All interactions work locally. Nothing is saved between page refreshes.

---

## Features

- 📋 Session list with `open`, `picked`, `failed`, and `locked` states
- ✋ Volunteer signup and withdrawal
- 👥 Classmates screen with presentation count and last pick date
- ⚙️ Admin panel — create, edit, delete sessions; clear data; reset history
- 🌍 Hungarian, English, and German language support
- 📱 Mobile-friendly with bottom navigation

---

## Behind the scenes

This started as a pretty small classroom problem. In my school, at the beginning of every history class, someone has to give an oral presentation. The teacher could just pick a student on the spot, but that's stressful for everyone, especially for the kid who gets surprised. Our alternative was to talk the day before and decide who wants to present, but it was always chaotic — information didn't reach everyone instantly, and there were misunderstandings about who had actually agreed.

My idea was simple: let students sign up *before* class if they're actually prepared, and then pick one of them randomly when class starts. No surprises for unprepared students, no unfair advantage for whoever shouts first, and no confusion over who gives the presentation.

What started as "I'll just make a quick signup form" turned into a full-blown app with auth, an admin panel, a scheduled backend function, multilingual support, a classmates leaderboard, and a fairly decent dark UI. As these things tend to go.

---

## Disclaimer

This project was built with the assistance of Claude by Anthropic. The code, documentation, and design were generated and iterated through a conversational development process. Most of this repo is vibe-coded.

---

## License

MIT
