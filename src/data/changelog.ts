export type ChangelogRelease = {
  date: string;
  status: "released" | "unreleased";
  updates: ReadonlyArray<{ title: string; description: string }>;
};

// One entry per date, newest first. Historical dates follow commit history.
// Keep pending work unreleased until deployment, then set its actual release date.
// Include meaningful user-facing changes; omit provisioning, internal work, and reverted features.
export const changelog: ReadonlyArray<ChangelogRelease> = [
  {
    date: "2026-10-20",
    status: "released",
    updates: [
      {
        title: "Find and invite friends",
        description: "Search for a full username in Friends, ignoring uppercase and lowercase, then tap the matching row to invite them. Pending invitations are marked Invited. Incoming requests appear under Invites, with check and cross buttons to accept or decline. Accepting adds each collector to the other’s friends list.",
      },
      {
        title: "Meet your fellow collectors",
        description: "Open Friends from the account tray to see your current friends, their profile pictures, and their collection progress. The heading and search stay visible while scrolling. New accounts start without friends; only accepted connections can browse each other’s collections.",
      },
      {
        title: "Explore a friend’s collection",
        description: "Tap a friend’s row to open their profile and switch between Owned and Wishlist. Search and filter their saved items without seeing the entire catalog. Collection progress counts released items only, and browsing cannot change either person’s collection or wishlist.",
      },
      {
        title: "Your own profile picture",
        description: "Tap your picture or its camera icon in Settings to choose a photo. Drag, use the zoom slider, or pinch on mobile to crop it, with a circular preview and an overview that appears while adjusting. Your saved picture appears in Settings, the account tray, and Friends.",
      },
      {
        title: "Save your wishlist",
        description: "Tap the heart on any item to save it to your personal wishlist, including upcoming releases. Choose Wishlist under Collection to see your saved items. Wishlisting stays separate from marking an item as owned.",
      },
      {
        title: "A clearer collection view",
        description: "Missing items look more muted, making collected items easier to spot, and thumbnails no longer have a corner checkbox. Progress bars are slightly thicker. On desktop and mobile, the Filters button opens a panel while leaving room for search.",
      },
      {
        title: "Less image reloading",
        description: "Profile pictures and product images can now stay cached for a day, reducing repeat downloads as you navigate or return to the app. Changing your profile picture still displays the new photo immediately.",
      },
      {
        title: "Keep up with what’s new",
        description: "Open the info icon in the account tray to see feature updates grouped by date.",
      },
    ],
  },
  // 3f2be66
  {
    date: "2026-10-19",
    status: "released",
    updates: [
      {
        title: "Page loading indicator",
        description: "A slim red bar at the top shows when you’re moving between pages, including browser back and forward navigation.",
      },
    ],
  },
  // b1e1949
  {
    date: "2026-10-13",
    status: "released",
    updates: [
      {
        title: "Account settings",
        description: "Open Settings from the account tray to view your username and change your password.",
      },
    ],
  },
  // 4e22c73, fc2d4d7
  {
    date: "2026-10-12",
    status: "released",
    updates: [
      {
        title: "A collection of your own",
        description: "Sign in with your username and password. Each account now has its own saved collection progress.",
      },
      {
        title: "Account tray",
        description: "Access account actions from the floating profile button. Hover to open it on desktop, or tap it on mobile.",
      },
    ],
  },
  // 73b7b81, ad79506
  {
    date: "2026-10-11",
    status: "released",
    updates: [
      {
        title: "More HIRONO to discover",
        description: "Expanded the catalog with more figures, plush, accessories, and special releases, alongside updated product images and official source links.",
      },
      {
        title: "Mixed IP filter",
        description: "Find releases featuring HIRONO alongside other characters using the Mixed IP tag and filter.",
      },
    ],
  },
  // 0f166e8
  {
    date: "2026-10-09",
    status: "released",
    updates: [
      {
        title: "Smoother mobile filters",
        description: "The mobile filter panel now expands and collapses smoothly while you browse.",
      },
    ],
  },
  // 74162ec
  {
    date: "2026-10-05",
    status: "released",
    updates: [
      {
        title: "Progress at a glance",
        description: "Your collected total and completion percentage stay visible in the header as you scroll through the catalog.",
      },
    ],
  },
  // 6d96a51
  {
    date: "2026-09-14",
    status: "released",
    updates: [
      {
        title: "Welcome to your hirono",
        description: "Browse HIRONO releases, mark the items you own, and track your progress across your collection and individual releases.",
      },
      {
        title: "Find your next collectible",
        description: "Search releases and items, or filter by product type and whether an item is owned or missing.",
      },
    ],
  },
];
