const GITHUB_GRAPHQL = "https://api.github.com/graphql";

const QUERY = /* GraphQL */ `
  query ($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      name
      login
      avatarUrl
      followers {
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              weekday
              contributionCount
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 10) {
          repository {
            name
            stargazerCount
            primaryLanguage {
              name
            }
          }
          contributions {
            totalCount
          }
        }
      }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        totalCount
        nodes {
          name
          stargazerCount
          primaryLanguage {
            name
          }
        }
      }
    }
  }
`;

export type ContributionDay = {
  date: string;
  weekday: number; // 0 = Sunday ... 6 = Saturday
  contributionCount: number;
};

export type RepoNode = {
  name: string;
  stargazerCount: number;
  primaryLanguage: { name: string } | null;
};

export type CommitsByRepo = {
  repository: RepoNode;
  contributions: { totalCount: number };
};

export type GitHubUser = {
  name: string | null;
  login: string;
  avatarUrl: string;
  followers: { totalCount: number };
  contributionsCollection: {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalIssueContributions: number;
    totalPullRequestReviewContributions: number;
    contributionCalendar: {
      totalContributions: number;
      weeks: { contributionDays: ContributionDay[] }[];
    };
    commitContributionsByRepository: CommitsByRepo[];
  };
  repositories: {
    totalCount: number;
    nodes: RepoNode[];
  };
};

/** Thrown when the requested username doesn't exist on GitHub. */
export class UserNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user "${username}" not found`);
    this.name = "UserNotFoundError";
  }
}

/**
 * Fetch a user's public GitHub data for the given date range.
 * `from` / `to` are ISO date strings (max span: 1 year).
 */
export async function fetchGitHubData(
  username: string,
  from: string,
  to: string,
): Promise<GitHubUser> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN. Add it to .env (see .env.example).");
  }

  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: username, from, to },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    data?: { user: GitHubUser | null };
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL error: ${json.errors[0].message}`);
  }
  if (!json.data?.user) {
    throw new UserNotFoundError(username);
  }

  return json.data.user;
}
