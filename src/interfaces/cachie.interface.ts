export interface SearchRecord {
  search_query: string;
  client_id: string;
  session_id: string;
}

export interface TokenAnalytics {
  exact_matches: number;
  fuzzy_matches: number;
  client_distribution: Record<string, number>;
  unique_sessions: Set<string>;
}

export interface TokenResult {
  exact_matches: number;
  fuzzy_matches: number;
  client_distribution: Record<string, number>;
  unique_sessions: number;
}

export interface AnalysisResult {
  results: Record<string, TokenResult>;
  stats: {
    processing_time: string;
    total_searches_analyzed: number;
    unique_clients: number;
    unique_sessions: number;
  } | undefined;
}

export type MatchType = "exact" | "fuzzy";


export interface ProcessingStatus {
  status: string;
  processed_tokens: number;
  processing_time: string;
}

