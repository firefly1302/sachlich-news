# Sachlich.News

Eine Nachrichten-Website die sachlich informiert - ohne Drama, Sensationalismus und emotionale Überschriften.

## Features

- Automatisches Laden von News aus Schweizer Quellen (20min, SRF, Blick)
- KI-gestütztes Umschreiben der Headlines und Zusammenfassungen ins Sachliche
- Kategorien: Zürich, Schweiz, International, People
- Responsive Design mit Tailwind CSS
- Optimiert für Vercel Deployment

## Setup

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **OpenAI API Key hinzufügen:**
   - Gehe zu https://platform.openai.com/api-keys
   - Erstelle einen neuen API Key
   - Kopiere den Key in `.env.local`:
     ```
     OPENAI_API_KEY=sk-your-key-here
     ```

3. **Development Server starten:**
   ```bash
   npm run dev
   ```

   Öffne http://localhost:3000

## Deployment auf Vercel

1. Pushe das Projekt zu GitHub
2. Verbinde GitHub-Repo mit Vercel
3. Füge Environment Variable hinzu: `OPENAI_API_KEY`
4. Deploy!

## Kosten

- OpenAI GPT-4o-mini: ~0.10-0.30 CHF/Tag (je nach Nutzung)
- Vercel: Dein bestehendes Abo sollte reichen

## Technologie

- **Next.js 15** mit App Router
- **TypeScript**
- **Tailwind CSS**
- **OpenAI GPT-4o-mini** für sachliches Umschreiben
- **RSS Parser** für News-Feeds
