import { NewsFeed } from './types';

// RSS Feeds für verschiedene Kategorien
export const NEWS_FEEDS: NewsFeed[] = [
  // Zürich
  {
    url: 'https://www.20min.ch/rss/rss.tmpl?get=1&type=channel&params=id=10000050',
    category: 'zuerich',
    name: '20min Zürich'
  },

  // Schweiz
  {
    url: 'https://www.20min.ch/rss/rss.tmpl?get=1&type=channel&params=id=10000002',
    category: 'schweiz',
    name: '20min Schweiz'
  },
  {
    url: 'https://www.srf.ch/news/bnf/rss/1646',
    category: 'schweiz',
    name: 'SRF News Schweiz'
  },

  // International
  {
    url: 'https://www.20min.ch/rss/rss.tmpl?get=1&type=channel&params=id=10000003',
    category: 'international',
    name: '20min International'
  },
  {
    url: 'https://www.srf.ch/news/bnf/rss/1645',
    category: 'international',
    name: 'SRF News International'
  },

  // People/Unterhaltung
  {
    url: 'https://www.20min.ch/rss/rss.tmpl?get=1&type=channel&params=id=10000006',
    category: 'people',
    name: '20min People'
  },
  {
    url: 'https://www.blick.ch/life/rss.xml',
    category: 'people',
    name: 'Blick Life'
  }
];
