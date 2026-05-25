const core = require("@actions/core");
const github = require("@actions/github");

function formatUptime(diffDays, lang) {
  const years = Math.floor(diffDays / 365);
  const days = diffDays % 365;

  if (lang === "pt") {
    const yearsLabel = years === 1 ? "ano" : "anos";
    const daysLabel = days === 1 ? "dia" : "dias";
    return `${years} ${yearsLabel}, ${days} ${daysLabel}`;
  }

  return `${years} years, ${days} days`;
}

async function fetchStats(token, username, lang = "en") {
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
    .filter(([name, size]) => size / totalLangSize > 0.02) // Filter out languages < 2%
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map((e) => e[0])
    .join(", ");

  let commits = 0;
  try {
    const creationYear = new Date(user.createdAt).getFullYear();
    const currentYear = new Date().getFullYear();

    for (let year = creationYear; year <= currentYear; year++) {
      const from = `${year}-01-01T00:00:00Z`;
      const to = `${year}-12-31T23:59:59Z`;

      const q = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              totalCommitContributions
              restrictedContributionsCount
            }
          }
        }
      `;
      const res = await octokit.graphql(q, { username, from, to });
      const coll = res.user.contributionsCollection;
      commits +=
        coll.totalCommitContributions + coll.restrictedContributionsCount;
    }
  } catch (e) {
    commits = "Hidden";
  }

  const createdAtDate = new Date(user.createdAt);
  const now = new Date();
  const diffDays = Math.floor((now - createdAtDate) / (1000 * 60 * 60 * 24));
  const uptime = formatUptime(diffDays, lang);

  return {
    uptime,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    repos: user.repositories.totalCount,
    stars,
    commits,
    languages: topLangs,
  };
}

module.exports = { fetchStats };
