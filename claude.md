# Sachlich.News - Entwicklungs-Dokumentation

## Projekt-Übersicht

Sachlich.News ist eine Nachrichten-Website, die News aus der Schweiz und der Welt sachlich und ohne Dramatik präsentiert. Der Grund für dieses Projekt: Viele Menschen fühlen sich von dramatischen Headlines und schockierenden Bildern in traditionellen News-Medien belastet, möchten aber trotzdem informiert bleiben.

## Konzept

- **Zielgruppe**: Menschen die informiert sein möchten, aber emotionale Belastung durch Sensationalismus vermeiden wollen
- **Lösung**: AI-gestütztes Umschreiben von News-Headlines, Zusammenfassungen und vollständigen Artikeln ins Sachliche
- **Quellen**:
  - RSS-Feeds: SRF.ch, Blick.ch, NZZ.ch, Infosperber, Zeitpunkt
  - Web-Scraping mit Paywall-Umgehung: Weltwoche, Nebelspalter (nur für private Nutzung)
- **Besonderheit**: User bleiben auf Sachlich.News - keine Weiterleitung zu dramatischen Original-Seiten

## Technische Architektur

### Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini für sachliches Umschreiben
- **News-Quellen**:
  - RSS-Parser für Schweizer Medien
  - Cheerio + Axios für Web-Scraping
  - 12ft.io für Paywall-Umgehung (private Nutzung)
- **Deployment**: Vercel

### Projektstruktur

```
sachlich-news/
├── app/
│   ├── api/
│   │   ├── news/          # API für News-Fetching & AI-Rewriting
│   │   ├── rewrite/       # API für vollständiges Artikel-Rewriting
│   │   └── scrape/        # API für Web-Scraping mit Paywall-Umgehung
│   ├── article/[id]/      # Artikel-Detailseite (sachlich aufbereitet)
│   ├── components/
│   │   ├── Header.tsx     # Haupt-Header mit Logo
│   │   ├── CategoryNav.tsx # Navigation zwischen Kategorien
│   │   └── NewsCard.tsx   # Einzelne News-Karte (mit Bild)
│   ├── zuerich/           # Zürich News-Seite
│   ├── schweiz/           # Schweiz News-Seite
│   ├── international/     # International News-Seite
│   ├── people/            # People News-Seite
│   ├── alternativ/        # Alternative Medien-Seite
│   └── page.tsx           # Homepage (alle News)
├── lib/
│   ├── types.ts           # TypeScript Definitionen
│   ├── news-sources.ts    # RSS Feed URLs + Scraping-Targets
│   ├── news-fetcher.ts    # RSS Fetching Logik
│   ├── web-scraper.ts     # Web-Scraping für Weltwoche/Nebelspalter
│   └── ai-rewriter.ts     # OpenAI Integration
└── .env.local             # Environment Variables (nicht in Git!)
```

## Features

### 1. Kategorien
- **Zürich**: Lokale News aus Zürich (NZZ Zürich, Blick Zürich)
- **Schweiz**: Schweizer News (SRF, Blick, NZZ)
- **International**: Weltnachrichten (SRF, Blick, NZZ)
- **People**: Prominente und Unterhaltung (Blick People & Life)
- **Alternativ**: Alternative/kritische Medien (Infosperber, Zeitpunkt, Weltwoche, Nebelspalter)

### 2. Interne Artikel-Detailseiten
- **Keine externe Weiterleitung**: User bleiben auf Sachlich.News
- **Vollständiges AI-Rewriting**: Gesamter Artikel wird sachlich umgeschrieben
- **Bilder-Anzeige**: News-Bilder werden (falls vorhanden) sachlich präsentiert
- **Optional Original-Link**: Am Ende des Artikels für Quellenprüfung

### 3. AI-Rewriting (GPT-4o-mini)
- **Headlines**: Dramatische Titel werden sachlich umformuliert
- **Zusammenfassungen**: 2-3 Sätze mit nur den wichtigsten Fakten
- **Vollständige Artikel**: On-Demand Umschreiben beim Klick auf Artikel
- **Prompt-Strategie**: Fokus auf Wer, Was, Wann, Wo, Warum - ohne emotionale Sprache

### 4. News-Fetching
- **RSS-Feeds**: SRF, Blick, NZZ, Infosperber, Zeitpunkt
- **Web-Scraping**: Weltwoche und Nebelspalter (mit Paywall-Umgehung über 12ft.io)
- 10 neueste Artikel pro Feed
- Sortierung nach Datum (neueste zuerst)
- Automatische Bild-Extraktion aus RSS-Feeds

### 5. Web-Scraping & Paywall-Umgehung
- **12ft.io Integration**: Umgehung von Paywalls für private Nutzung
- **Cheerio HTML-Parsing**: Extraktion von Artikel-Inhalten
- **Intelligente Selektoren**: Automatische Erkennung verschiedener Website-Strukturen
- **Vollständige Artikel**: Bei Weltwoche/Nebelspalter wird der komplette Artikel gescrapt und umgeschrieben
- **WICHTIG**: Nur für private Familien-Nutzung gedacht, nicht öffentlich teilen

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

## Kosten-Optimierung & Erwartete Kosten

- **GPT-4o-mini statt Claude**: ~10x günstiger
- **Headlines + Summary umschreiben**: ~5 Cent für 20 Artikel
- **Vollständige Artikel (RSS)**: ~0.07 Rappen pro Artikel
- **Web-Scraping + Umschreiben**: ~0.07 Rappen pro vollständigem Artikel
- **On-Demand Rewriting**: Volle Artikel nur bei Klick, nicht vorher
- **Erwartete Kosten**:
  - Bei normaler Nutzung: 0.20-0.50 CHF/Monat
  - Bei intensiver Nutzung (50+ Artikel/Tag): ~1-2 CHF/Monat

**Hinweis**: Web-Scraping verbraucht etwas mehr API-Tokens da vollständige Artikel umgeschrieben werden, aber Kosten bleiben überschaubar.

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

## Aktuelle Features (Live auf sachlich-news.vercel.app)

✅ Sachliche News-Übersicht mit Bildern
✅ 5 Kategorien: Zürich, Schweiz, International, People, Alternativ
✅ Interne Artikel-Detailseiten (kein Verlassen der Seite)
✅ **Vollständige Artikel-Scraping für ALLE Quellen** (nicht nur Summaries)
✅ AI-Rewriting von vollständigen Artikeln mit GPT-4o-mini
✅ Responsive Design für Mobile, Tablet und Desktop
✅ **News-Quellen:**
  - RSS: SRF, Blick, NZZ, Infosperber, Zeitpunkt, Schweizer Monat
  - Web-Scraping: Weltwoche, Nebelspalter (mit Paywall-Umgehung, private Nutzung)
✅ Jeder Artikel wird vollständig gescrapt und sachlich umgeschrieben (5-15 Sek)

## Zukünftige Verbesserungen

### Potenzielle Features:
- **Caching-Layer**: Datenbank für umgeschriebene Artikel (vermeidet wiederholte API-Calls)
- **Auto-Refresh**: Cron Job alle 30-60 Min für automatische News-Updates
- **Favoriten/Lesezeichen**: User können Artikel für später speichern
- **RSS Feed**: Eigener RSS-Feed mit sachlichen News zum Abonnieren
- **Dark Mode**: Für angenehmeres Lesen am Abend
- **Lesefortschritt**: Markierung von gelesenen Artikeln
- **Mehr Quellen**: Tagesanzeiger, Watson, etc.

### Performance-Optimierungen:
- Server-Side Rendering mit Caching (schnellere Ladezeiten)
- Edge Caching für häufig aufgerufene Artikel
- Bildkomprimierung und Lazy Loading

## Entwickelt mit Claude Code

Dieses Projekt wurde komplett mit Claude Code (Sonnet 4.5) entwickelt.

**Entwicklungszeit**: ~1 Session
**Code-Qualität**: Production-ready mit TypeScript
**Best Practices**: Next.js App Router, moderne React Patterns
