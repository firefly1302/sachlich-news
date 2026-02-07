# Sachlich.News - Entwicklungs-Dokumentation

## Projekt-Übersicht

Sachlich.News ist eine Nachrichten-Website, die News aus der Schweiz und der Welt sachlich und ohne Dramatik präsentiert. Der Grund für dieses Projekt: Viele Menschen fühlen sich von dramatischen Headlines und schockierenden Bildern in traditionellen News-Medien belastet, möchten aber trotzdem informiert bleiben.

## Konzept

- **Zielgruppe**: Menschen die informiert sein möchten, aber emotionale Belastung durch Sensationalismus vermeiden wollen
- **Lösung**: AI-gestütztes Umschreiben von News-Headlines und Zusammenfassungen ins Sachliche
- **Quellen**: RSS-Feeds von 20min.ch, SRF.ch, Blick.ch

## Technische Architektur

### Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini für sachliches Umschreiben
- **News-Quellen**: RSS-Parser für Schweizer Medien
- **Deployment**: Vercel

### Projektstruktur

```
sachlich-news/
├── app/
│   ├── api/
│   │   ├── news/          # API für News-Fetching & AI-Rewriting
│   │   └── rewrite/       # API für vollständiges Artikel-Rewriting
│   ├── components/
│   │   ├── Header.tsx     # Haupt-Header mit Logo
│   │   ├── CategoryNav.tsx # Navigation zwischen Kategorien
│   │   └── NewsCard.tsx   # Einzelne News-Karte
│   ├── zuerich/           # Zürich News-Seite
│   ├── schweiz/           # Schweiz News-Seite
│   ├── international/     # International News-Seite
│   ├── people/            # People News-Seite
│   └── page.tsx           # Homepage (alle News)
├── lib/
│   ├── types.ts           # TypeScript Definitionen
│   ├── news-sources.ts    # RSS Feed URLs
│   ├── news-fetcher.ts    # RSS Fetching Logik
│   └── ai-rewriter.ts     # OpenAI Integration
└── .env.local             # Environment Variables (nicht in Git!)
```

## Features

### 1. Kategorien
- **Zürich**: Lokale News aus Zürich
- **Schweiz**: Schweizer News (ohne alle Details aus anderen Kantonen)
- **International**: Wichtige Weltnachrichten
- **People**: Prominente und Unterhaltung

### 2. AI-Rewriting
- **Headlines**: Dramatische Titel werden sachlich umformuliert
- **Zusammenfassungen**: 2-3 Sätze mit nur den wichtigsten Fakten
- **Prompt-Strategie**: Fokus auf Wer, Was, Wann, Wo, Warum - ohne emotionale Sprache

### 3. News-Fetching
- RSS-Feeds werden ausgelesen
- 10 neueste Artikel pro Feed
- Sortierung nach Datum (neueste zuerst)
- Original-Quelle wird verlinkt

## AI-Prompting-Strategie

Der AI-Prompt entfernt aktiv:
- Dramatische Worte: "schockierend", "erschütternd", "tragisch", "Horror"
- Emotionale Sprache und Übertreibungen
- Unnötige Details die nur schockieren sollen

Fokus auf:
- Sachliche Fakten
- Neutrale Sprache
- Schweizer Hochdeutsch
- Informativ aber nicht belastend

## Kosten-Optimierung

- **GPT-4o-mini statt Claude**: ~10x günstiger
- **Headlines + Summary umschreiben**: ~5 Cent für 20 Artikel
- **On-Demand Rewriting**: Volle Artikel nur bei Klick
- **Caching**: Umgeschriebene Artikel werden gespeichert
- **Erwartete Kosten**: 0.10-0.30 CHF/Tag

## Environment Variables

```bash
OPENAI_API_KEY=sk-...  # OpenAI API Key für GPT-4o-mini
```

## Deployment auf Vercel

1. GitHub Repository erstellen
2. Projekt pushen
3. Vercel mit GitHub verbinden
4. Environment Variable `OPENAI_API_KEY` hinzufügen
5. Deploy

## Zukünftige Verbesserungen

### Potenzielle Features:
- **Caching-Layer**: Datenbank für umgeschriebene Artikel (Supabase/Vercel Postgres)
- **Auto-Refresh**: Cron Job alle 30-60 Min für automatische News-Updates
- **Favoriten**: User können Artikel speichern
- **RSS Feed**: Eigener RSS-Feed mit sachlichen News
- **Dark Mode**: Für angenehmeres Lesen
- **Notifications**: Push-Benachrichtigungen für wichtige News
- **Mehr Quellen**: NZZ, Tagesanzeiger, etc.

### Performance-Optimierungen:
- Server-Side Rendering mit Caching
- Image-Optimization für News-Bilder
- Lazy Loading für bessere Performance

## Entwickelt mit Claude Code

Dieses Projekt wurde komplett mit Claude Code (Sonnet 4.5) entwickelt.

**Entwicklungszeit**: ~1 Session
**Code-Qualität**: Production-ready mit TypeScript
**Best Practices**: Next.js App Router, moderne React Patterns
