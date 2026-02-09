import { NewsFeed } from './types';

// RSS Feeds für verschiedene Kategorien
// SRF (funktioniert zuverlässig) + 20min (via Scraping)
// Blick blockiert alle Zugriffe (RSS + Scraping) mit 403
export const NEWS_FEEDS: NewsFeed[] = [
  // Zürich - lokale News
  {
    url: 'https://www.srf.ch/news/regional/zuerich-schaffhausen.rss',
    category: 'zuerich',
    name: 'SRF Zürich'
  },
  {
    url: 'SCRAPE:20min-zuerich',
    category: 'zuerich',
    name: '20 Minuten Zürich'
  },

  // Schweiz - aktuelle News
  {
    url: 'https://www.srf.ch/news/bnf/rss/1646',
    category: 'schweiz',
    name: 'SRF News Schweiz'
  },
  {
    url: 'SCRAPE:20min-schweiz',
    category: 'schweiz',
    name: '20 Minuten Schweiz'
  },

  // International
  {
    url: 'https://www.srf.ch/news/bnf/rss/1645',
    category: 'international',
    name: 'SRF News International'
  },
  {
    url: 'SCRAPE:20min-ausland',
    category: 'international',
    name: '20 Minuten Ausland'
  },

  // People/Unterhaltung - inkl. Sport
  {
    url: 'https://www.srf.ch/sport.rss',
    category: 'people',
    name: 'SRF Sport'
  },
  {
    url: 'SCRAPE:20min-people',
    category: 'people',
    name: '20 Minuten People'
  },

  // Alternative Medien (unabhängig & kritisch)
  {
    url: 'https://www.infosperber.ch/feed/',
    category: 'alternativ',
    name: 'Infosperber'
  },
  {
    url: 'https://www.zeitpunkt.ch/rss.xml',
    category: 'alternativ',
    name: 'Zeitpunkt'
  },
  {
    url: 'https://schweizermonat.ch/feed/',
    category: 'alternativ',
    name: 'Schweizer Monat'
  },
  {
    url: 'SCRAPE:weltwoche',
    category: 'alternativ',
    name: 'Weltwoche'
  },
  {
    url: 'SCRAPE:nebelspalter',
    category: 'alternativ',
    name: 'Nebelspalter'
  }
];
