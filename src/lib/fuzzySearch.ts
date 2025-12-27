/**
 * Arabic to Roman numeral mapping (1-12)
 */
const arabicToRoman: { [key: string]: string } = {
  '1': 'i', '2': 'ii', '3': 'iii', '4': 'iv', '5': 'v',
  '6': 'vi', '7': 'vii', '8': 'viii', '9': 'ix', '10': 'x',
  '11': 'xi', '12': 'xii'
};

/**
 * Roman to Arabic numeral mapping
 */
const romanToArabic: { [key: string]: string } = {
  'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', 'v': '5',
  'vi': '6', 'vii': '7', 'viii': '8', 'ix': '9', 'x': '10',
  'xi': '11', 'xii': '12'
};

/**
 * Expand a token to include its numeral equivalent
 */
function expandToken(token: string): string[] {
  const expanded = [token];
  
  // If token is Arabic numeral, add Roman equivalent
  if (arabicToRoman[token]) {
    expanded.push(arabicToRoman[token]);
  }
  
  // If token is Roman numeral, add Arabic equivalent
  if (romanToArabic[token]) {
    expanded.push(romanToArabic[token]);
  }
  
  return expanded;
}

/**
 * Calculate similarity between two strings using token matching
 */
function tokenize(str: string): string[] {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Check if a word contains another word (partial match)
 */
function partialMatch(word: string, query: string): number {
  if (word === query) return 1.0;
  if (word.startsWith(query)) return 0.8;
  if (word.includes(query)) return 0.5;
  return 0;
}

/**
 * Simple Levenshtein distance for typo tolerance
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate fuzzy similarity between query token and target token
 */
function tokenSimilarity(queryToken: string, targetToken: string): number {
  // Expand both tokens to include numeral equivalents
  const queryExpanded = expandToken(queryToken);
  const targetExpanded = expandToken(targetToken);
  
  // Check for exact match including numeral equivalents
  for (const q of queryExpanded) {
    for (const t of targetExpanded) {
      if (q === t) return 1.0;
    }
  }
  
  // Partial match (prefix, contains) - check all expanded versions
  for (const q of queryExpanded) {
    for (const t of targetExpanded) {
      const partial = partialMatch(t, q);
      if (partial > 0) return partial;
    }
  }
  
  // Typo tolerance (only for longer tokens)
  if (queryToken.length >= 3 && targetToken.length >= 3) {
    const distance = levenshteinDistance(queryToken, targetToken);
    const maxLen = Math.max(queryToken.length, targetToken.length);
    const similarity = 1 - (distance / maxLen);
    // Only accept if similarity is high enough (typo tolerance)
    if (similarity >= 0.6) return similarity * 0.7;
  }
  
  return 0;
}

export interface FuzzyResult<T> {
  item: T;
  score: number;
  isExactMatch: boolean;
}

/**
 * Perform fuzzy search on a list of items
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string,
  minScore = 0.3
): FuzzyResult<T>[] {
  const queryTokens = tokenize(query);
  
  if (queryTokens.length === 0) {
    return items.map(item => ({ item, score: 1, isExactMatch: true }));
  }

  const results: FuzzyResult<T>[] = [];

  for (const item of items) {
    const text = getSearchText(item);
    const textLower = text.toLowerCase();
    const targetTokens = tokenize(text);
    
    // Check for exact substring match first
    const queryString = queryTokens.join(' ');
    const isExactMatch = textLower.includes(queryString);
    
    if (isExactMatch) {
      results.push({ item, score: 1.0, isExactMatch: true });
      continue;
    }
    
    // Calculate fuzzy score based on token matching
    let totalScore = 0;
    let matchedTokens = 0;
    
    for (const queryToken of queryTokens) {
      let bestTokenScore = 0;
      
      for (const targetToken of targetTokens) {
        const similarity = tokenSimilarity(queryToken, targetToken);
        bestTokenScore = Math.max(bestTokenScore, similarity);
      }
      
      if (bestTokenScore > 0) {
        totalScore += bestTokenScore;
        matchedTokens++;
      }
    }
    
    // Normalize score
    const score = matchedTokens > 0 
      ? (totalScore / queryTokens.length) * (matchedTokens / queryTokens.length)
      : 0;
    
    if (score >= minScore) {
      results.push({ item, score, isExactMatch: false });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}
