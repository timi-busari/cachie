import cachieService from "../services/cachie.service";
import logger from "../utils/logger.util";
import { describe, test, expect, beforeEach, jest, it } from "@jest/globals";

// Mock the logger
jest.mock("../utils/logger.util", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("CachieService", () => {
  beforeEach(() => {
    // Reset the CachieService instance before each test
    // @ts-ignore - accessing private property for testing
    cachieService.searchData.clear();
    cachieService.queries = [];
    jest.clearAllMocks();
  });

  describe("recordSearch", () => {
    it("should successfully record a search query and process tokens", () => {
      const result = cachieService.recordSearch({
        searchQuery: "hello world",
        clientId: "client1",
        sessionId: "session1",
      });

      expect(result.status).toBe("ok");
      expect(result.processed_tokens).toBe(2);
      expect(result.processing_time).toMatch(/\d+ms/);

      // verifying query was stored
      expect(cachieService.queries).toHaveLength(1);
      expect(cachieService.queries[0]).toEqual({
        query: "hello world",
        clientId: "client1",
        sessionId: "session1",
      });

      // verify token was recorded
      // @ts-ignore - accessing private property for testing
      const tokenData = cachieService.searchData.get("hello world");
      expect(tokenData).toBeDefined();
      expect(tokenData?.exact_matches).toBe(1);
      expect(tokenData?.client_distribution["client1"]).toBe(1);
      expect(tokenData?.unique_sessions.has("session1")).toBe(true);
    });

    it("should handle multiple searches from the same client and session", () => {
      // record same search twice
      cachieService.recordSearch({
        searchQuery: "test query",
        clientId: "client1",
        sessionId: "session1",
      });

      cachieService.recordSearch({
        searchQuery: "test query",
        clientId: "client1",
        sessionId: "session1",
      });

      // @ts-ignore - accessing private property for testing
      const tokenData = cachieService.searchData.get("test query");
      expect(tokenData?.exact_matches).toBe(2);
      expect(tokenData?.client_distribution["client1"]).toBe(2);
      expect(tokenData?.unique_sessions.size).toBe(1);
    });

    it("should log errors when processing fails", () => {
      // Mock implementation to throw error
      jest.spyOn(cachieService.queries, "push").mockImplementation(() => {
        throw new Error("Test error");
      });

      expect(() =>
      cachieService.recordSearch({
          searchQuery: "test query",
          clientId: "client1",
          sessionId: "session1",
        })
      ).toThrow("Test error");

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("analyzeToken", () => {
    beforeEach(() => {
      cachieService.recordSearch({
        searchQuery: "hello world",
        clientId: "client1",
        sessionId: "session1",
      });

      cachieService.recordSearch({
        searchQuery: "hello there",
        clientId: "client2",
        sessionId: "session2",
      });
    });

    it("should analyze exact matches correctly", () => {
      const result = cachieService.analyzeToken({
        analysisToken: "hello world",
        matchType: "exact",
        includeStats: true,
      });

      expect(result.results["hello world"]).toEqual({
        exact_matches: 1,
        fuzzy_matches: 1,
        client_distribution: { client1: 1 },
        unique_sessions: 1,
      });

      expect(result.stats).toBeDefined();
      expect(result.stats?.total_searches_analyzed).toBe(2);
      expect(result.stats?.unique_clients).toBe(1);
      expect(result.stats?.unique_sessions).toBe(1);
    });

    it("should analyze fuzzy matches correctly", () => {
      const result = cachieService.analyzeToken({
        analysisToken: "hello werld", // this was intentionally misspelled
        matchType: "fuzzy",
        includeStats: true,
      });

      // it should match 'hello world' due to fuzzy matching
      expect(result.results["hello werld"].fuzzy_matches).toBeGreaterThan(0);
      expect(
        Object.keys(result.results["hello werld"].client_distribution)
      ).toContain("client1");
    });

    it("should handle multiple token analysis", () => {
      const result = cachieService.analyzeToken({
        analysisToken: "hello world, hello there",
        matchType: "exact",
        includeStats: true,
      });

      expect(Object.keys(result.results)).toHaveLength(2);
      expect(result.results["hello world"]).toBeDefined();
      expect(result.results["hello there"]).toBeDefined();
    });

    it("should return empty results for non-existent tokens", () => {
      const result = cachieService.analyzeToken({
        analysisToken: "nonexistent token",
        matchType: "exact",
        includeStats: true,
      });

      expect(result.results["nonexistent token"]).toEqual({
        exact_matches: 0,
        fuzzy_matches: 0,
        client_distribution: {},
        unique_sessions: 0,
      });
    });

    it("should handle errors gracefully", () => {
      // mocking implementation to throw error
      jest.spyOn(cachieService.queries, "forEach").mockImplementation(() => {
        throw new Error("Test error");
      });

      const result = cachieService.analyzeToken({
        analysisToken: "test token",
        matchType: "fuzzy",
        includeStats: true,
      });

      expect(result.results).toEqual({});
      expect(result.stats).toBeDefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("private methods", () => {
    it("should correctly identify fuzzy matches", () => {
      // @ts-ignore - accessing private method for testing
      const result = cachieService._isFuzzyMatch("world", "werld");
      expect(result).toBe(true);

      // @ts-ignore - accessing private method for testing
      const noMatch = cachieService._isFuzzyMatch("world", "completely");
      expect(noMatch).toBe(false);
    });
  });
});
