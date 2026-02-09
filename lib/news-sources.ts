import { NewsFeed } from './types';

// RSS Feeds für verschiedene Kategorien
// Fokus auf Blick (paywall-frei) und 20min (via Scraping)
export const NEWS_FEEDS: NewsFeed[] = [
  // Zürich - lokale News
  {
    url: 'https://www.blick.ch/schweiz/zuerich/rss.xml',
    category: 'zuerich',
    name: 'Blick Zürich'
  },
  {
    url: 'SCRAPE:20min-zuerich',
    category: 'zuerich',
    name: '20 Minuten Zürich'
  },

  // Schweiz - aktuelle News
  {
    url: 'https://www.blick.ch/schweiz/rss.xml',
    category: 'schweiz',
    name: 'Blick Schweiz'
  },
  {
    url: 'https://www.blick.ch/politik/rss.xml',
    category: 'schweiz',
    name: 'Blick Politik'
  },
  {
    url: 'https://www.blick.ch/wirtschaft/rss.xml',
    category: 'schweiz',
    name: 'Blick Wirtschaft'
  },
  {
    url: 'SCRAPE:20min-schweiz',
    category: 'schweiz',
    name: '20 Minuten Schweiz'
  },

  // International
  {
    url: 'https://www.blick.ch/ausland/rss.xml',
    category: 'international',
    name: 'Blick Ausland'
  },
  {
    url: 'SCRAPE:20min-ausland',
    category: 'international',
    name: '20 Minuten Ausland'
  },

  // People/Unterhaltung - inkl. Sport
  {
    url: 'https://www.blick.ch/people-tv/rss.xml',
    category: 'people',
    name: 'Blick People & TV'
  },
  {
    url: 'https://www.blick.ch/life/rss.xml',
    category: 'people',
    name: 'Blick Life'
  },
  {
    url: 'https://www.blick.ch/sport/rss.xml',
    category: 'people',
    name: 'Blick Sport'
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
