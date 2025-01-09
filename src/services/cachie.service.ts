import {
  TokenAnalytics,
  AnalysisResult,
  MatchType,
  TokenResult,
  ProcessingStatus,
} from "../interfaces/types";
import logger from "../logger";

class CachieService {
  private searchData: Map<string, TokenAnalytics>;
  public queries: Array<{
    query: string;
    clientId: string;
    sessionId: string;
  }>;

  constructor() {
    this.searchData = new Map<string, TokenAnalytics>();
    this.queries = [];
    logger.info("CacheService initialized.");
  }

  /**
   * Records a search query and processes tokens.
   */
  recordSearch({
    searchQuery,
    clientId,
    sessionId,
  }: {
    searchQuery: string;
    clientId: string;
    sessionId: string;
  }): ProcessingStatus {
    const startTime = Date.now();
    const tokens = searchQuery.toLowerCase().split(/\s+/);

    logger.info(
      `Recording search: "${searchQuery}" for client "${clientId}" in session "${sessionId}".`
    );

    try {
      // Store complete query data
      this.queries.push({
        query: searchQuery.toLowerCase(),
        clientId,
        sessionId,
      });

      logger.info(`Stored query: "${searchQuery}".`);

      // Record tokens
      for (let i = 0; i < tokens.length - 1; i++) {
        const biToken = `${tokens[i]} ${tokens[i + 1]}`;
        this._recordToken(biToken, clientId, sessionId);
      }

      const processingTime = `${Date.now() - startTime}ms`;
      logger.info(`Search processed in ${processingTime}.`);

      return {
        status: "ok",
        processed_tokens: tokens.length,
        processing_time: processingTime,
      };
    } catch (error) {
      logger.error("Error processing search:", error);
      throw error;
    }
  }

  /**
   * Private method to record a token in search data.
   */
  private _recordToken(
    token: string,
    clientId: string,
    sessionId: string
  ): void {
    logger.info(
      `Recording token: "${token}" for client "${clientId}" and session "${sessionId}".`
    );

    if (!this.searchData.has(token)) {
      this.searchData.set(token, {
        exact_matches: 0,
        fuzzy_matches: 0,
        client_distribution: {},
        unique_sessions: new Set<string>(),
      });
      logger.info(`Initialized data for token: "${token}".`);
    }

    const tokenData = this.searchData.get(token)!;
    tokenData.exact_matches++;
    tokenData.client_distribution[clientId] =
      (tokenData.client_distribution[clientId] || 0) + 1;
    tokenData.unique_sessions.add(sessionId);
    logger.info(`Updated data for token: "${token}".`);
  }

  /**
   * Private method to determine if two tokens match fuzzily.
   */
  private _isFuzzyMatch(token1: string, token2: string): boolean {
    const chars1 = new Set(token1);
    const chars2 = new Set(token2);
    const commonChars = [...chars1].filter((char) => chars2.has(char)).length;
    const similarity = commonChars / Math.max(token1.length, token2.length);
    return similarity >= 0.7;
  }

  /**
   * Analyzes tokens based on match type.
   */
  analyzeToken({
    analysisToken,
    matchType = "exact",
    includeStats = false,
  }: {
    analysisToken: string;
    matchType: MatchType;
    includeStats: boolean;
  }): AnalysisResult {
    try {
      const startTime = Date.now();
      const tokenPairs = analysisToken
        .toLowerCase()
        .split(",")
        .map((t) => t.trim());
      const results: Record<string, TokenResult> = {};
      const allSessions = new Set<string>();
      const allClients = new Set<string>();

      logger.info(
        `Analyzing tokens: "${analysisToken}" with match type "${matchType}".`
      );

      for (const tokenPair of tokenPairs) {
        const tokenData = this.searchData.get(tokenPair) || {
          exact_matches: 0,
          fuzzy_matches: 0,
          client_distribution: {},
          unique_sessions: new Set<string>(),
        };

        if (matchType === "fuzzy") {
          const clientMatches: Record<string, number> = {};
          const matchingSessions = new Set<string>();

          // Process all queries for fuzzy matches
          this.queries.forEach(({ query, clientId, sessionId }) => {
            const tokens = query.split(/\s+/);
            for (let i = 0; i < tokens.length - 1; i++) {
              const biToken = `${tokens[i]} ${tokens[i + 1]}`;
              if (
                tokenPair === biToken ||
                this._isFuzzyMatch(tokenPair, biToken)
              ) {
                clientMatches[clientId] = (clientMatches[clientId] || 0) + 1;
                matchingSessions.add(sessionId);
                allSessions.add(sessionId);
                allClients.add(clientId);
              }
            }
          });

          results[tokenPair] = {
            exact_matches: tokenData.exact_matches,
            fuzzy_matches: Object.values(clientMatches).reduce(
              (sum, count) => sum + count,
              0
            ),
            client_distribution: clientMatches,
            unique_sessions: matchingSessions.size,
          };
        } else {
          results[tokenPair] = {
            exact_matches: tokenData.exact_matches,
            fuzzy_matches: tokenData.exact_matches,
            client_distribution: { ...tokenData.client_distribution },
            unique_sessions: tokenData.unique_sessions.size,
          };

          tokenData.unique_sessions.forEach((s) => allSessions.add(s));
          Object.keys(tokenData.client_distribution).forEach((c) =>
            allClients.add(c)
          );
        }
      }

      const processingTime = `${Date.now() - startTime}ms`;
      logger.info(`Token analysis completed in ${processingTime}.`);

      return {
        results,
        stats: includeStats
          ? {
              processing_time: processingTime,
              total_searches_analyzed: this.queries.length,
              unique_clients: allClients.size,
              unique_sessions: allSessions.size,
            }
          : undefined,
      };
    } catch (error) {
      logger.error("Error analyzing token:", error);
      return {
        results: {},
        stats: {
          processing_time: "0ms",
          total_searches_analyzed: 0,
          unique_clients: 0,
          unique_sessions: 0,
        },
      };
    }
  }
}

export default new CachieService();
