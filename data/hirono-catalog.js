/*
 * HIRONO collection catalog
 * Add future releases here; the UI and completion logic require no other edits.
 * Dates reflect the earliest verified official release window where available.
 */
/* Data-only module consumed by the Next.js application. */
  const slug = (value) => value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const makeItems = (releaseId, names, options = {}) => names.map((name, index) => {
    const secret = /secret|dreaming|unknown journey|belonging|silence|puppet|stuffed bear|the pilot|ning ning|never growing up|the disembodied|highway imprint|boundary|tempered aegis/i.test(name);
    return {
      id: `${releaseId}-${slug(name.replace(/\s*\(secret\)\s*/gi, ""))}`,
      name: name.replace(/\s*\((secret|special)\)\s*/gi, ""),
      rarity: secret ? "secret" : /\(special\)/i.test(name) ? "special" : "standard",
      odds: secret ? (options.secretOdds || null) : null,
      image: options.images?.[index]
        ? { src: options.images[index], alt: `HIRONO ${name.replace(/\s*\(.+\)\s*/g, "")} collectible` }
        : null
    };
  });

  const release = (data) => ({
    ...data,
    year: Number(data.releaseDate.slice(0, 4)),
    items: makeItems(data.id, data.itemNames, {
      secretOdds: data.secretOdds,
      images: data.itemImages
    })
  });

  const otherOneImages = [
    "https://global-static.popmart.com/globalAdmin/1732003742204____the-ghost____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732004171097____the-fox____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732004005165____amnesia____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732003756778____nowhere-safe____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732004094533____vagrancy____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732004152872____the-monster____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732004075213____the-crow____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732004113350____being-alive____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732003951303____marionette____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732003918689____raving____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732003979811____staring____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732004132352____cuckoo____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp",
    "https://global-static.popmart.com/globalAdmin/1732004190662____secret____.png?x-oss-process=image%2Fresize%2Cw_512%2Fquality%2Cq_90%2Fformat%2Cwebp"
  ];

  export const catalog = [
    release({
      id: "hirono-the-other-one",
      name: "The Other One Series",
      releaseDate: "2021-10-01",
      type: "Figure Series",
      category: "figures",
      collectionType: "blind-box",
      description: "The debut collection: thirteen small portraits of solitude, courage and strange little comforts.",
      palette: ["#c2aa93", "#685b50"],
      sourceUrl: "https://www.popmart.com/ca/products/3190/hirono-the-other-one-series",
      secretOdds: "1/144",
      itemNames: ["The Ghost", "The Fox", "Amnesia", "Nowhere Safe", "Vagrancy", "The Monster", "The Crow", "Being Alive", "Marionette", "Raving", "Staring", "Cuckoo", "Dreaming (Secret)"],
      itemImages: otherOneImages
    }),
    release({
      id: "hirono-little-mischief",
      name: "Little Mischief Series",
      releaseDate: "2022-07-15",
      type: "Figure Series",
      category: "figures",
      collectionType: "blind-box",
      description: "A playful chapter filled with improvised costumes, tiny rebellions and a sense of adventure.",
      palette: ["#d2bda1", "#8b705d"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      secretOdds: "1/144",
      itemNames: ["Loose Fish", "Manacle", "The Aviator", "Protector", "Persona", "Robot", "Birdman", "Ragpicker", "Destroyer", "Pretender", "Boiling Frog", "Float", "Unknown Journey (Secret)"]
    }),
    release({
      id: "hirono-city-of-mercy",
      name: "City of Mercy Series",
      releaseDate: "2022-12-22",
      type: "Figure Series",
      category: "figures",
      collectionType: "blind-box",
      description: "A quieter, more sculptural series about kindness and finding a place to belong.",
      palette: ["#9aa19a", "#5f6762"],
      sourceUrl: "https://www.popmart.com/gb/products/-hirono-city-of-mercy-series/fd9a7a86-4bbe-432e-9a83-89d375e9670d",
      secretOdds: "1/72",
      itemNames: ["The Other", "Insight", "Comfortably Numb", "Healer", "Fallen Angel", "Echo", "Belonging (Secret)", "Wandering (Special)"]
    }),
    release({
      id: "hirono-mime",
      name: "Mime Series",
      releaseDate: "2023-07-14",
      type: "Figure Series",
      category: "figures",
      collectionType: "blind-box",
      description: "Thirteen wordless studies in expression, staged like a pocket-sized black-box theatre.",
      palette: ["#b9b4ad", "#5a5552"],
      sourceUrl: "https://arttoyfamilia.com/pages/hirono-series",
      secretOdds: "1/144",
      itemNames: ["Guardian", "Blind", "Seeker", "Devilry", "Drifter", "Fool", "Patience", "Unspoken", "Prison", "Destroy", "Poem", "Secrecy", "Silence (Secret)"]
    }),
    release({
      id: "hirono-reshape",
      name: "Reshape Series",
      releaseDate: "2023-10-27",
      type: "Figure Series",
      category: "figures",
      collectionType: "blind-box",
      description: "Textural figures about change, repair and the unfamiliar shapes we grow into.",
      palette: ["#b78d7e", "#6f5750"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      secretOdds: "1/108",
      itemNames: ["Burst", "Wood Carving", "Fading", "Healing", "Paradise Lost", "Drowning", "Costume", "Parasite", "Voyage", "Puppet (Secret)"]
    }),
    release({
      id: "hirono-shelter",
      name: "Shelter Series",
      releaseDate: "2024-06-14",
      type: "Figure Series",
      category: "figures",
      collectionType: "blind-box",
      description: "Found objects become miniature places of refuge in this warm, architectural collection.",
      palette: ["#b7a47d", "#75684e"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      secretOdds: "1/144",
      itemNames: ["Sunny Doll", "Poet", "Birdy", "Alien", "Warrior", "Candleholder", "Mantel Clock", "Bird Cage", "Traffic Cone", "Fort", "Circus", "Cabin", "Stuffed Bear (Secret)"]
    }),
    release({
      id: "hirono-le-petit-prince",
      name: "Hirono × Le Petit Prince",
      releaseDate: "2024-10-25",
      type: "Collaboration",
      category: "collaborations",
      collectionType: "blind-box",
      collaboration: "Le Petit Prince",
      description: "Hirono wanders through Antoine de Saint-Exupéry's beloved little universe.",
      palette: ["#8fa5b2", "#d1a86e"],
      sourceUrl: "https://arttoyfamilia.com/pages/hirono-series",
      itemNames: ["The Little Prince", "The Rose", "The King", "The Conceited Man", "The Tippler", "The Businessman", "The Lamplighter", "The Geographer", "The Snake", "The Fox", "The Switchman", "The Merchant", "The Little Prince (Special)", "The Pilot (Secret)"]
    }),
    release({
      id: "hirono-clot",
      name: "Hirono × CLOT Series",
      releaseDate: "2024-12-13",
      type: "Collaboration",
      category: "collaborations",
      collectionType: "blind-box",
      collaboration: "CLOT",
      description: "A six-piece meeting of HIRONO's weathered charm and CLOT's streetwear language.",
      palette: ["#aa6c59", "#553d37"],
      sourceUrl: "https://arttoyfamilia.com/pages/hirono-series",
      secretOdds: "1/72",
      itemNames: ["Yin-yang", "Kung Fu", "Alienegra", "Chinese", "Terracotta Army", "Silk Royale", "Ning Ning (Secret)"]
    }),
    release({
      id: "hirono-echo",
      name: "Echo Series",
      releaseDate: "2025-03-28",
      type: "Figure Series",
      category: "figures",
      collectionType: "blind-box",
      description: "Fragments of memory return as rain, luck, late nights and half-remembered companions.",
      palette: ["#7f92a0", "#5a626b"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      secretOdds: "1/144",
      itemNames: ["Pieces of Memory", "Back Off", "Caught You", "Staying Up", "Daydreaming", "Knight", "Journey in the Rain", "Soul Connection", "Eaten", "Get Lucky", "Breakout Plan", "Hiding Behind You", "Never Growing Up (Secret)"]
    }),
    release({
      id: "hirono-echo-pendant-chain",
      name: "Echo Pendant Chain Blind Box",
      releaseDate: "2025-04-11",
      type: "Accessory Blind Box",
      category: "accessories",
      collectionType: "blind-box",
      description: "Seven wearable miniatures adapted from the Echo collection.",
      palette: ["#9ea9ae", "#68787d"],
      sourceUrl: "https://www.popmart.com/us/products/3464/hirono-echo-series-pendant-chain-blind-box",
      secretOdds: "1/72",
      itemNames: ["Staying Up", "Get Lucky", "Knight", "Caught You", "Pieces of Memory", "Back Off", "Never Growing Up (Secret)"]
    }),
    release({
      id: "hirono-echo-cable",
      name: "Echo 2-in-1 Cable Blind Box",
      releaseDate: "2025-04-11",
      type: "Accessory Blind Box",
      category: "accessories",
      collectionType: "blind-box",
      description: "Seven character-topped charging cables adapted from the Echo collection.",
      palette: ["#91a0a7", "#58666c"],
      sourceUrl: "https://www.popmart.com/us/products/2079/hirono-echo-series-2-in-1-cable-blind-box",
      secretOdds: "1/72",
      itemNames: ["Get Lucky", "Knight", "Pieces of Memory", "Hiding Behind You", "Soul Connection", "Eaten", "Never Growing Up (Secret)"]
    }),
    release({
      id: "hirono-echo-mini-bag",
      name: "Echo Mini Bag Blind Box",
      releaseDate: "2025-04-11",
      type: "Accessory Blind Box",
      category: "accessories",
      collectionType: "blind-box",
      description: "Seven miniature textile bags carrying favourite Echo motifs.",
      palette: ["#a6afb1", "#687478"],
      sourceUrl: "https://www.popmart.com/us/products/2161/hirono-echo-series-mini-bag-blind-box",
      secretOdds: "1/72",
      itemNames: ["Back Off", "Caught You", "Knight", "Get Lucky", "Staying Up", "Pieces of Memory", "Never Growing Up (Secret)"]
    }),
    release({
      id: "hirono-echo-magnet-clip",
      name: "Echo Fridge Magnet Clip Blind Box",
      releaseDate: "2025-04-11",
      type: "Accessory Blind Box",
      category: "accessories",
      collectionType: "blind-box",
      description: "Seven practical magnetic clips, each holding a small piece of the Echo story.",
      palette: ["#94a3aa", "#66767d"],
      sourceUrl: "https://www.popmart.com/us/products/2164/hirono-echo-series-fridge-magnet-clip-blind-box",
      secretOdds: "1/72",
      itemNames: ["Get Lucky", "Caught You", "Knight", "Staying Up", "Pieces of Memory", "Back Off", "Never Growing Up (Secret)"]
    }),
    release({
      id: "hirono-monsters-carnival",
      name: "Monsters’ Carnival Series",
      releaseDate: "2025-08-22",
      type: "Figure Series",
      category: "figures",
      collectionType: "blind-box",
      description: "A softly spooky, light-up carnival of familiar monsters and strange night visitors.",
      palette: ["#817684", "#4b444d"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      secretOdds: "1/72",
      itemNames: ["Grim Reaper", "Doctor Beak", "Killer Bunny", "Zombie", "Vampire", "Creepy Clown", "The Disembodied (Secret)"]
    }),
    release({
      id: "hirono-road-journal-plush",
      name: "Road Journal Plush Pendant Series",
      releaseDate: "2025-12-18",
      type: "Plush Series",
      category: "plush",
      collectionType: "blind-box",
      description: "Soft travel companions shaped by foggy roads, woven woods and the dust of faraway cities.",
      palette: ["#a1a494", "#696e63"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      secretOdds: "1/72",
      itemNames: ["Into Fogwild", "Lost in the Night", "Frostfall Hour", "Woven Woods", "Grey Gravel", "City Dust Afloat", "Highway Imprint (Secret)"]
    }),
    release({
      id: "hirono-road-journal-phone-lanyard",
      name: "Road Journal Phone Lanyard Blind Box",
      releaseDate: "2025-12-18",
      type: "Accessory Blind Box",
      category: "accessories",
      collectionType: "blind-box",
      description: "Textile phone lanyards carrying the seven landscapes of the Road Journal series.",
      palette: ["#adb0a2", "#74776d"],
      sourceUrl: "https://www.popmart.com/us/products/4925",
      secretOdds: "1/72",
      itemNames: ["Into Fogwild", "Lost in the Night", "Frostfall Hour", "Woven Woods", "Grey Gravel", "City Dust Afloat", "Highway Imprint (Secret)"]
    }),
    release({
      id: "hirono-road-journal-mini-bag",
      name: "Road Journal Mini Bag Blind Box",
      releaseDate: "2025-12-18",
      type: "Accessory Blind Box",
      category: "accessories",
      collectionType: "blind-box",
      description: "Seven tiny soft bags made from the textures and landscapes of Road Journal.",
      palette: ["#a3a697", "#6c7066"],
      sourceUrl: "https://www.popmart.com/us/products/5167/hirono-road-journal-series-mini-bag-blind-box-8365",
      secretOdds: "1/72",
      itemNames: ["Into Fogwild", "Lost in the Night", "Frostfall Hour", "Woven Woods", "Grey Gravel", "City Dust Afloat", "Highway Imprint (Secret)"]
    }),
    release({
      id: "hirono-road-journal-magnets",
      name: "Road Journal Fridge Magnet Blind Box",
      releaseDate: "2025-12-18",
      type: "Accessory Blind Box",
      category: "accessories",
      collectionType: "blind-box",
      description: "Seven magnetic mementos from the Road Journal collection.",
      palette: ["#9da194", "#666b61"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      secretOdds: "1/72",
      itemNames: ["Into Fogwild", "Lost in the Night", "Frostfall Hour", "Woven Woods", "Grey Gravel", "City Dust Afloat", "Highway Imprint (Secret)"]
    }),
    release({
      id: "hirono-snoopy-figure",
      name: "Hirono × Snoopy Figure",
      releaseDate: "2025-04-11",
      type: "Standalone Figure",
      category: "collaborations",
      collectionType: "standalone",
      collaboration: "Snoopy",
      description: "A single display figure pairing Hirono with the world's most thoughtful beagle.",
      palette: ["#d3c9ad", "#777164"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["Hirono × Snoopy"]
    }),
    release({
      id: "hirono-tamed-wildgrass",
      name: "Tamed Wildgrass Series",
      releaseDate: "2026-02-13",
      type: "Figure Series",
      category: "figures",
      collectionType: "blind-box",
      description: "A meditation on modern routines, escape and the stubborn wildness that remains underneath.",
      palette: ["#8d9b77", "#5b6650"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      secretOdds: "1/144",
      itemNames: ["Sisyphean Work", "Caged Bird", "Full-time", "Camping", "Self-Anchored", "Boiling Frog", "City Escape", "Fated", "Digital Bind", "Live Under Receipts", "Overload", "Canned Dreams", "Boundary (Secret)"]
    }),
    release({
      id: "hirono-little-hare-plush",
      name: "Little Hare Plush Doll Pendant",
      releaseDate: "2026-04-02",
      type: "Plush Pendant",
      category: "plush",
      collectionType: "standalone",
      description: "A soft standalone Hare companion, ready to travel or sit quietly on a shelf.",
      palette: ["#c8bda9", "#8c7c6d"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["Little Hare"]
    }),
    release({
      id: "hirono-mist-walker",
      name: "Mist-Walker Plush Pendant Series",
      releaseDate: "2026-07-23",
      type: "Plush Series",
      category: "plush",
      collectionType: "blind-box",
      description: "Seven spectral plush companions wandering through wings, shadow and soft silver mist.",
      coverImage: "https://cdn.shopify.com/s/files/1/0866/2535/4046/files/Popmart_Hirono_Mist-Walker_Series.jpg?v=1781269223",
      palette: ["#9ca1a3", "#555d62"],
      sourceUrl: "https://arttoyfamilia.com/pages/hirono-series",
      secretOdds: "1/72",
      itemNames: ["The Soul Corroder", "The Wingless Follower", "The Backlit Messenger", "The Unfallen Wing", "The Gap-Glimmer Wanderer", "The Primordial Grace", "The Tempered Aegis (Secret)"]
    }),
    release({
      id: "hirono-dino-plush",
      name: "Dino Plush Doll Pendant",
      releaseDate: "2026-08-27",
      type: "Plush Pendant",
      category: "plush",
      collectionType: "standalone",
      description: "The familiar green dinosaur look returns as a tactile standalone plush pendant.",
      palette: ["#9aaa86", "#667359"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["Dino"]
    }),
    release({
      id: "hirono-kodak-click-bear-plush",
      name: "Hirono × Kodak Click Bear Plush Pendant",
      releaseDate: "2026-08-06",
      type: "Plush Pendant",
      category: "collaborations",
      collectionType: "standalone",
      collaboration: "Kodak",
      description: "A nostalgic camera-ready plush created with Kodak Click Bear.",
      palette: ["#d0a254", "#8b573b"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["Kodak Click Bear"]
    }),
    release({
      id: "hirono-after-dark-plush",
      name: "After Dark Plush Doll Pendant Series",
      releaseDate: "2026-09-03",
      type: "Plush Series",
      category: "plush",
      collectionType: "blind-box",
      description: "A nocturnal pendant collection for the hours when ordinary rooms become strange places.",
      palette: ["#706977", "#37343d"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["Masked", "Runaway", "Off Script", "Drifting By", "Hollow", "Upside Down", "Old Dream (Secret)"],
      secretOdds: "1/72"
    }),
    release({
      id: "hirono-after-dark-magnets",
      name: "After Dark Fridge Magnet Blind Box",
      releaseDate: "2026-09-03",
      type: "Accessory Blind Box",
      category: "accessories",
      collectionType: "blind-box",
      description: "Seven small metal keepsakes from the After Dark collection.",
      palette: ["#807988", "#46404d"],
      sourceUrl: "https://www.popmart.com/us/pop-now/set/1382",
      itemNames: ["Masked", "Runaway", "Off Script", "Drifting By", "Hollow", "Upside Down", "Old Dream (Secret)"],
      secretOdds: "1/72"
    }),
    release({
      id: "hirono-after-dark-night-light",
      name: "After Dark Night Light Charm Blind Box",
      releaseDate: "2026-09-03",
      type: "Accessory Blind Box",
      category: "accessories",
      collectionType: "blind-box",
      description: "Seven pocket-sized light-up charms from the nocturnal After Dark collection.",
      palette: ["#77717e", "#403b47"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["Masked", "Runaway", "Off Script", "Drifting By", "Hollow", "Upside Down", "Old Dream (Secret)"],
      secretOdds: "1/72"
    }),
    release({
      id: "hirono-the-hundreds-figure",
      name: "Hirono × The Hundreds Figure",
      releaseDate: "2026-09-03",
      type: "Collaboration",
      category: "collaborations",
      collectionType: "standalone",
      collaboration: "The Hundreds",
      description: "A standalone streetwear collaboration figure with The Hundreds.",
      palette: ["#b7a28d", "#3e3b38"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["The Hundreds Figure"]
    }),
    release({
      id: "hirono-the-hundreds-pendant",
      name: "Hirono × The Hundreds Pendant",
      releaseDate: "2026-09-03",
      type: "Pendant",
      category: "collaborations",
      collectionType: "standalone",
      collaboration: "The Hundreds",
      description: "A compact wearable companion from the HIRONO × The Hundreds collaboration.",
      palette: ["#c1ad98", "#4d4741"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["The Hundreds Pendant"]
    }),
    release({
      id: "hirono-harry-potter",
      name: "Hirono × Harry Potter Series",
      releaseDate: "2026-10-08",
      type: "Collaboration",
      category: "collaborations",
      collectionType: "blind-box",
      collaboration: "Harry Potter",
      status: "upcoming",
      description: "An upcoming magical collaboration. It is visible in the archive but excluded from completion until release.",
      palette: ["#776856", "#3f3a36"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["Design 01", "Design 02", "Design 03", "Design 04", "Design 05", "Design 06", "Design 07", "Design 08", "Design 09", "Design 10", "Design 11", "Design 12", "Secret Design (Secret)"],
      secretOdds: "TBA"
    })
  ].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
