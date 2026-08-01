# GoChat

Studio for composing **LINE-style chat** and **lock-screen notification** previews (MyGO!!!!! presets included). Edit in real time on an iPhone-sized frame, then export.

## Features

- **Chat mode** — edit messages, senders, and titles; hover for insert / delete; playback with adjustable gap; **export playback as WebM/MP4 video**
- **Notif mode** — edit lock-screen date, time, weekday, and notification rows (sender, message, relative time); clear all via the center ✕
- **Export** — download the notif preview as a PNG; download chat playback as video
- **i18n** — Chinese (default), English, Japanese (`/zh`, `/en`, `/ja`); language select in the header
- **Theme** — light / dark toggle
- **Presets** — JSON under `public/presets/` (users, chats, notifications); chat drafts persist in `localStorage`

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS 4 + shadcn/ui
- Zustand + Immer (studio runtime kit)
- Ultracite (oxlint + oxfmt)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you’ll be redirected to `/zh` (or your preferred locale).

```bash
npm run build   # production build
npm run start   # serve production build
npm run check   # lint / format check
npm run fix     # auto-fix lint / format
```

## Project layout

| Path                 | Role                                                |
| -------------------- | --------------------------------------------------- |
| `app/[lang]/`        | Locale-aware pages                                  |
| `components/chat/`   | Chat compound UI                                    |
| `components/notif/`  | Notification / lock-screen UI                       |
| `components/studio/` | Studio shell, canvases, controls                    |
| `components/i18n/`   | Dictionary provider + locale select                 |
| `lib/i18n/`          | Locales, dictionaries, `getDictionary`              |
| `lib/presets.ts`     | Loads users / chats / notifs from `public/presets/` |
| `proxy.ts`           | Locale detection & redirect                         |

## Presets

- `public/presets/users/<id>/` — avatar + `profile.json`
- `public/presets/chats/*.json` — chat threads
- `public/presets/notifications/*.json` — notification stacks

Add or edit JSON there; the studio loads them on the server at request time.

## Roadmap

Edit `public/roadmap.json` to track planned work. Each item has `id`, `title`, `status` (`pending` | `completed`), and `createdTime` (ISO 8601). The map button at the bottom-left of the studio opens this list.

## License

Private / unpublished (`0.0.1`).
