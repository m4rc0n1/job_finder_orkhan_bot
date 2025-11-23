function matchesKeyword(job, keyword) {
  if (!keyword || keyword.toLowerCase() === "any") return true;
  return job.title.toLowerCase().includes(keyword.toLowerCase());
}

function matchesLocation(job, location) {
  if (!location || location.toLowerCase() === "any") return true;
  return job.location.toLowerCase().includes(location.toLowerCase());
}

function matchesSalary(job, minSalary) {
  if (!minSalary) return true;
  return Number(job.salary) >= Number(minSalary);
}

function matchesSeniority(job, seniority) {
  if (!seniority || seniority.toLowerCase() === "any") return true;
  return job.seniority.toLowerCase().includes(seniority.toLowerCase());
}

function matchesTags(job, tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return true;
  return tags.some((t) =>
    job.tags.map((jt) => jt.toLowerCase().includes(t.toLowerCase()))
  );
}

function matchJobWithUser(job, prefs) {
  return (
    matchesKeyword(job, prefs.keyword) &&
    matchesLocation(job, prefs.location) &&
    matchesSalary(job, prefs.minSalary) &&
    matchesSeniority(job, prefs.seniority) &&
    matchesTags(job, prefs.tags)
  );
}

module.exports = { matchJobWithUser };
