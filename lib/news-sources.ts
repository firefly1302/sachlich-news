import { NewsFeed } from './types';

// RSS Feeds für verschiedene Kategorien
export const NEWS_FEEDS: NewsFeed[] = [
  // Zürich - nutzen Schweiz-Feeds mit Zürich-Bezug
  {
    url: 'https://www.nzz.ch/zuerich.rss',
    category: 'zuerich',
    name: 'NZZ Zürich'
  },
  {
    url: 'https://www.blick.ch/schweiz/zuerich/rss.xml',
    category: 'zuerich',
    name: 'Blick Zürich'
  },

  // Schweiz
  {
    url: 'https://www.srf.ch/news/bnf/rss/1646',
    category: 'schweiz',
    name: 'SRF News Schweiz'
  },
  {
    url: 'https://www.blick.ch/schweiz/rss.xml',
    category: 'schweiz',
    name: 'Blick Schweiz'
  },
  {
    url: 'https://www.nzz.ch/schweiz.rss',
    category: 'schweiz',
    name: 'NZZ Schweiz'
  },

  // International
  {
    url: 'https://www.srf.ch/news/bnf/rss/1645',
    category: 'international',
    name: 'SRF News International'
  },
  {
    url: 'https://www.blick.ch/ausland/rss.xml',
    category: 'international',
    name: 'Blick Ausland'
  },
  {
    url: 'https://www.nzz.ch/international.rss',
    category: 'international',
    name: 'NZZ International'
  },

  // People/Unterhaltung
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
  }
];
