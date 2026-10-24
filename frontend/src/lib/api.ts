const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ArticleItem {
  id?: string;
  title: string;
  url: string;
  domain: string;
  publisher_name: string;
  published_at?: string;
  snippet?: string;
  wing: "LEFT" | "CENTER" | "RIGHT" | "UNCLASSIFIED";
  is_saved?: boolean;
  ai_suggested?: boolean;
}

export interface PerspectiveSummary {
  left_perspective: string;
  center_perspective: string;
  right_perspective: string;
  fact_consensus: string;
  bias_divergence: string;
}

export interface NewsSearchResponse {
  query: string;
  expanded_queries: string[];
  perspective_summary?: PerspectiveSummary;
  left_articles: ArticleItem[];
  center_articles: ArticleItem[];
  right_articles: ArticleItem[];
  unclassified_articles: ArticleItem[];
  total_articles: number;
}

export interface DomainClassification {
  id: number;
  domain: string;
  publisher_name: string;
  wing: "LEFT" | "CENTER" | "RIGHT" | "UNCLASSIFIED";
  updated_at: string;
}

export interface SavedArticle {
  id: number;
  user_id: number;
  title: string;
  url: string;
  domain: string;
  wing: string;
  snippet?: string;
  publisher_name?: string;
  published_at?: string;
  saved_at: string;
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  searched_at: string;
}

function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("satyalens_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.detail || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<User>(res);
  },

  async searchNews(query: string): Promise<NewsSearchResponse> {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`${API_BASE_URL}/api/news/search?q=${encoded}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<NewsSearchResponse>(res);
  },

  async getClassifications(wing?: string): Promise<DomainClassification[]> {
    const url = wing
      ? `${API_BASE_URL}/api/classifications?wing=${encodeURIComponent(wing)}`
      : `${API_BASE_URL}/api/classifications`;
    const res = await fetch(url);
    return handleResponse<DomainClassification[]>(res);
  },

  async updateClassification(
    domain: string,
    wing: string,
    publisherName?: string
  ): Promise<DomainClassification> {
    const res = await fetch(`${API_BASE_URL}/api/classifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        domain,
        wing,
        publisher_name: publisherName || domain,
      }),
    });
    return handleResponse<DomainClassification>(res);
  },

  async getBookmarks(): Promise<SavedArticle[]> {
    const res = await fetch(`${API_BASE_URL}/api/bookmarks`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<SavedArticle[]>(res);
  },

  async saveBookmark(article: {
    title: string;
    url: string;
    domain: string;
    wing: string;
    snippet?: string;
    publisher_name?: string;
    published_at?: string;
  }): Promise<SavedArticle> {
    const res = await fetch(`${API_BASE_URL}/api/bookmarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(article),
    });
    return handleResponse<SavedArticle>(res);
  },

  async deleteBookmark(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/bookmarks/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to remove bookmark: ${res.status}`);
    }
  },

  async deleteBookmarkByUrl(url: string): Promise<void> {
    const encoded = encodeURIComponent(url);
    const res = await fetch(`${API_BASE_URL}/api/bookmarks/by-url?url=${encoded}`, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to remove bookmark: ${res.status}`);
    }
  },

  async getHistory(): Promise<SearchHistoryItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/history`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<SearchHistoryItem[]>(res);
  },

  async clearHistory(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/history`, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to clear history: ${res.status}`);
    }
  },

  async healthCheck(): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse(res);
  },
};
