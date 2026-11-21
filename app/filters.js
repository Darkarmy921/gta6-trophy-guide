// Trophy list filtering: by kind, grade, earned state and free text.
// A trophy matches the "missable" kind when its missable flag is set; the
// "online" kind matches nothing in the official list, by design — the list
// holds no online trophies, and this filter shows that honestly.
export function trophyMatchesFilters(trophy, filters, earnedSet) {
  if (filters.kind !== 'all') {
    if (filters.kind === 'missable') {
      if (!trophy.missable) return false;
    } else if (filters.kind === 'online') {
      return false;
    } else if (trophy.kind !== filters.kind) {
      return false;
    }
  }
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.hideEarned && earnedSet.has(trophy.name)) return false;
  if (filters.search) {
    const needle = filters.search.toLowerCase();
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

// Spoiler-safe display: story trophies stay hidden until earned. The name
// and the official description are both replaced; the grade and kind stay
// visible so the list still reads as a checklist.
export function spoilerSafeName(trophy, spoilerOn, isEarned) {
  if (spoilerOn && trophy.kind === 'story' && !isEarned) return 'Hidden story trophy';
  return trophy.name;
}

export function spoilerSafeDescription(trophy, spoilerOn, isEarned) {
  if (spoilerOn && trophy.kind === 'story' && !isEarned) {
    return 'Story spoiler hidden — earn this trophy to reveal its name and description.';
  }
  return trophy.description;
}

// Count earned trophies per grade for the progress card.
export function countEarnedByGrade(trophies, earnedSet) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (earnedSet.has(trophy.name)) counts[trophy.grade] += 1;
  }
  return counts;
}
