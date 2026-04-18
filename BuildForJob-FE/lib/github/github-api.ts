import axios from "axios";

/**
 * Extracts the GitHub username from a profile URL.
 * @param url GitHub profile URL
 */
export function extractUsername(url: string): string {
  if (!url) return "";
  try {
    const parts = url.split("github.com/");
    if (parts.length < 2) return "";
    return parts[1].split("/")[0].replace("/", "");
  } catch (error) {
    console.error("Error extracting username:", error);
    return "";
  }
}

/**
 * GitHub Fetching Pipeline
 */
export async function fetchGitHubData(username: string, token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    // 1. Fetch Profile Data
    const userRes = await axios.get(`https://api.github.com/users/${username}`, { headers });
    const user = userRes.data;

    // 2. Fetch Repositories
    const repoRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
    const repos = repoRes.data;

    // 3. Extract Languages (Method 1: Basic from repos)
    const languages: Record<string, number> = {};
    repos.forEach((repo: any) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    const skills = Object.keys(languages);

    // 4. Fetch README.md (from profile repo: username/username)
    let readme = null;
    const branches = ["main", "master"];

    for (const branch of branches) {
      try {
        const readmeUrl = `https://raw.githubusercontent.com/${username}/${username}/${branch}/README.md`;
        const readmeRes = await axios.get(readmeUrl);
        readme = readmeRes.data;
        break;
      } catch (err) {
        // Continue to next branch
      }
    }

    // 5. Format Projects (Deduplicated and filtered)
    const uniqueRepos = new Map();
    repos.forEach((repo: any) => {
      // Prioritize non-forks and unique names
      if (!uniqueRepos.has(repo.name) || !repo.fork) {
        uniqueRepos.set(repo.name, repo);
      }
    });

    const projects = Array.from(uniqueRepos.values())
      .filter((repo: any) => !repo.fork) // Usually users only want their own projects
      .slice(0, 50) // Reasonable limit
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        tech: repo.language,
        stars: repo.stargazers_count,
        url: repo.html_url,
        updated_at: repo.updated_at,
      }));

    return {
      profile: {
        name: user.name,
        bio: user.bio,
        avatar: user.avatar_url,
        followers: user.followers,
        following: user.following,
        location: user.location,
        public_repos: user.public_repos,
        html_url: user.html_url,
        company: user.company,
        blog: user.blog,
      },
      skills,
      projects,
      readme,
    };
  } catch (error: any) {
    console.error("Error fetching GitHub data:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch GitHub data");
  }
}
