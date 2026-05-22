const core = require('@actions/core');
const github = require('@actions/github');

async function fetchStats(token, username) {
  const octokit = github.getOctokit(token);
  
  const query = `
    query($username: String!) {
      user(login: $username) {
        createdAt
        followers { totalCount }
        following { totalCount }
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            stargazerCount
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node { name }
              }
            }
          }
        }
      }
    }
  `;

  const { user } = await octokit.graphql(query, { username });

  let stars = 0;
  const langSize = {};
  let totalLangSize = 0;
  
  for (const repo of user.repositories.nodes) {
    stars += repo.stargazerCount;
    for (const edge of repo.languages.edges) {
      langSize[edge.node.name] = (langSize[edge.node.name] || 0) + edge.size;
      totalLangSize += edge.size;
    }
  }

  const topLangs = Object.entries(langSize)
    .filter(([name, size]) => (size / totalLangSize) > 0.02) // Filter out languages < 2%
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(e => e[0])
    .join(", ");

  let commits = 0;
  try {
    const res = await octokit.rest.search.commits({
      q: `author:${username}`,
      per_page: 1
    });
    commits = res.data.total_count;
  } catch (e) {
    commits = "Hidden";
  }

  const createdAtDate = new Date(user.createdAt);
  const now = new Date();
  const diffDays = Math.floor((now - createdAtDate) / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const days = diffDays % 365;
  const uptime = `${years} years, ${days} days`;

  return {
    uptime,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    repos: user.repositories.totalCount,
    stars,
    commits,
    languages: topLangs
  };
}

module.exports = { fetchStats };
