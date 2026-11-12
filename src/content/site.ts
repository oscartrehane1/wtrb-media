export const navigationItems = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/services" },
  { label: "Approach", href: "/#approach" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

export const serviceCategories = [
  {
    title: "Campaign Strategy & Creative Direction",
    shortDescription: "Define the objective, audience, message and creative idea before production begins.",
    challenge: "You need content that looks distinctive, but you also need clarity about who it is for, what it should communicate and what action it should support.",
    approach: "We work collaboratively to turn the commercial objective into a focused campaign concept, messaging direction and practical production brief.",
    deliverables: ["Audience and objective definition", "Creative concepts and messaging", "Campaign briefs, storyboards and shot books", "Content and production planning"],
    connection: "This creates a shared strategic foundation for production and helps every asset serve a clear role.",
  },
  {
    title: "Film & Photography Production",
    shortDescription: "Create cinematic, useful assets for campaigns, launches and standalone production briefs.",
    challenge: "You need film or photography that feels true to the brand, works in demanding locations and can be adapted for the channels where it will appear.",
    approach: "We bring creative direction, location planning and hands-on production together, scaling the crew and deliverables to suit the brief.",
    deliverables: ["Commercial and destination films", "Brand, product and experience storytelling", "Outdoor, adventure and lifestyle photography", "Aerial production and post-production"],
    connection: "Standalone production remains available, while broader briefs can be planned as a coordinated family of campaign assets.",
  },
  {
    title: "Content Campaigns & Distribution",
    shortDescription: "Shape coordinated assets for websites, social platforms, advertising and campaign launches.",
    challenge: "A strong hero film alone may not provide the range, formats or publishing rhythm needed for a joined-up launch.",
    approach: "We plan deliverables around the intended channels, then prepare platform-specific edits and a practical rollout framework for your team or partners.",
    deliverables: ["Website, social and advertising assets", "Platform-specific edits and cutdowns", "Campaign content calendars", "Launch planning and distribution support"],
    connection: "The aim is to make production more useful across the campaign—not to prescribe a large-scale media-buying service.",
  },
  {
    title: "Performance & Optimisation",
    shortDescription: "Agree what useful performance looks like, review the evidence and improve future creative decisions.",
    challenge: "Without agreed objectives and a simple measurement framework, it is difficult to understand what content contributed or what to improve next.",
    approach: "We can help define practical success measures, review available performance data and turn observations into recommendations for future content.",
    deliverables: ["Campaign measurement frameworks", "Content performance reviews", "Creative testing plans", "Reporting and future recommendations"],
    connection: "Measurement is proportionate to the project and available data; it does not imply guaranteed outcomes or management of large paid-media budgets.",
  },
] as const;

export const approachStages = [
  { title: "Discover", description: "Understand the brand, audience, challenge and commercial objective." },
  { title: "Plan", description: "Develop the campaign concept, creative direction, deliverables and production plan." },
  { title: "Create", description: "Produce and edit compelling films, photography and content assets." },
  { title: "Launch", description: "Prepare and coordinate content for its intended channels and campaign rollout." },
  { title: "Learn", description: "Review performance against agreed objectives and identify opportunities to improve." },
] as const;

export const sectors = [
  "Tourism and destinations",
  "Outdoor and adventure brands",
  "Experiences and hospitality",
  "Outdoor events and active lifestyles",
] as const;
