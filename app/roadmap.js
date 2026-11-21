// The platinum roadmap: six stages built only from what the official
// descriptions imply — story chapters in order first, then side characters
// and strangers, then collectibles and exploration, then activities, then
// money and 100% cleanup, with the platinum itself last. Each trophy in
// app/data/trophies.json carries its roadmapStage; this module groups them
// and names each stage, so the roadmap view is a view over the same data
// the checklist uses, never a second copy of it.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Story: Chapters 1–4',
    advice: 'Play the main missions in order. Chapter trophies and the named-mission trophies unlock from story progress alone. Do the missable-flagged named missions on your first pass — the official descriptions promise no replay.',
  },
  {
    stage: 2,
    title: 'Stage 2 — The finale',
    advice: 'Complete the final mission for the gold trophy. Before you start it, sweep up any missable story trophies from earlier chapters.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Side characters & strangers',
    advice: 'Finish each side character\u2019s mission strand to its final mission, and complete 8 full stranger strands across Leonida. Finish one strand at a time rather than starting many at once.',
  },
  {
    stage: 4,
    title: 'Stage 4 — Collectibles & exploration',
    advice: 'Meditation spots, card sets, WAiNK It locations, vehicle discoveries, the 52 areas of Leonida, garages and Scooter Bros registrations. Work region by region with the map open so nothing is left behind.',
  },
  {
    stage: 5,
    title: 'Stage 5 — Activities & combat',
    advice: 'Stunts, shooting-range golds, races, fishing, arcade, challenges, robberies, hunts and the one-off world moments. Most of these are repeatable, so they are safe to leave until after the story.',
  },
  {
    stage: 6,
    title: 'Stage 6 — Money, 100% & the platinum',
    advice: 'Launder $250,000 of Marked Bills, spend $100,000 in shops, buy the last garages, and push completion to 100%. The platinum pops the moment the other 54 trophies are done.',
  },
];

// Group the trophies into their roadmap stages, in stage order.
export function buildRoadmap(trophies) {
  return ROADMAP_STAGES.map((stage) => ({
    ...stage,
    trophies: trophies.filter((trophy) => trophy.roadmapStage === stage.stage),
  }));
}

// The missable list: every trophy whose official description ties it to a
// named story mission, a character's final mission, or a one-off choice or
// event. Sorted by roadmap stage so the earliest risks come first.
export function buildMissableList(trophies) {
  return trophies
    .filter((trophy) => trophy.missable)
    .sort((a, b) => a.roadmapStage - b.roadmapStage || a.id - b.id);
}
