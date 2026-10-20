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
    releaseDate: data.releaseDate || null,
    year: data.releaseDate ? Number(data.releaseDate.slice(0, 4)) : data.releaseYear || null,
    sourceKind: data.sourceKind || "official",
    tags: data.tags || [],
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

  const popMartVerifiedReleaseData = [
  {
    "id": "the-golden-gallop-series",
    "name": "The Golden Gallop Series",
    "releaseDate": "2026-01-08",
    "releaseYear": 2026,
    "type": "Figure",
    "category": "figures",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/5611/the-golden-gallop-series-figures",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251231_154433_233085____6_the-golden-gallop-series-figures_blind-boxes_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Luck On The Way — Regular Version",
      "Luck On The Way — Special Version (Special)"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1767164229554____luck-on-the-way____.png",
      "https://global-static.popmart.com/globalAdmin/1767164402219____special_luck-on-the-way____.png"
    ]
  },
  {
    "id": "finding-mokoko",
    "name": "Look For Mokoko",
    "releaseDate": "2024-11-29",
    "releaseYear": 2024,
    "type": "Figure",
    "category": "figures",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/1699/finding-mokoko-series-figures",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20241122_185236_093166____scence_finding-mokoko-series-figures_blind-boxes_details_popmart-us_____1200x1200.jpg",
    "itemNames": [
      "See You"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1732521252856____see-you____.png"
    ]
  },
  {
    "id": "hand-in-hand-series",
    "name": "Hand In Hand Series",
    "releaseDate": "2025-05-16",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "figures",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/2180",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20250509_151727_195883____scene_hand-in-hand-series-figures_blind-boxes_details_popmart-us_____1200x1200.jpg",
    "itemNames": [
      "Intervals Of Silence"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1747018371408____intervals-of-silence____.png"
    ]
  },
  {
    "id": "celebrating-the-moment-popmart-15th-annivesary-series",
    "name": "Celebrating The Moment-Popmart 15th Anniversary Series",
    "releaseDate": "2025-10-23",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "figures",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/4045",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251017_182557_530275____scene_celebrating-the-moment-pop-mart-15th-anniversary-series-figures_blind-boxes_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "321 Boom!"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1760687581251____3-2-1-boom____.png"
    ]
  },
  {
    "id": "dear-birds-series-plush-pendant",
    "name": "Dear Birds Series Plush Pendant",
    "releaseDate": "2026-07-23",
    "releaseYear": 2026,
    "type": "Plush Pendant",
    "category": "plush",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#b7aa98",
      "#6f655b"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/6352/dear-birds-series-plush-pendant-blind-box",
    "sourceKind": "official",
    "coverImage": "https://prod-global-biz.popmart.com/globalAdmin/1785315688012_843600f20c67415c837439720a423db2.jpg",
    "itemNames": [
      "My Deepest Secret",
      "More Than Words  (Secret)"
    ],
    "itemImages": [
      "https://prod-global-biz.popmart.com/globalAdmin/1784600048175_dfeaa492071461709a63acbcd9d6337c.jpg",
      "https://prod-global-biz.popmart.com/globalAdmin/1784600059222_71bfc8f445c293a2701320887c4c591f.jpg"
    ]
  },
  {
    "id": "have-a-good-run-series-plush-pendant",
    "name": "Have A Good Run Series Plush Pendant",
    "releaseDate": "2026-01-08",
    "releaseYear": 2026,
    "type": "Plush Pendant",
    "category": "plush",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#b7aa98",
      "#6f655b"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/5616/have-a-good-run-series-plush-pendant-blind-box-7939",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251231_165133_720515____4_have-a-good-run-series-plush-pendant-blind-box_plush-toys_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Good Health"
    ],
    "itemImages": [
      "https://prod-global-biz.popmart.com/globalAdmin/1789107628794_a365144942c74b86433a0af1c63446cb.jpg"
    ]
  },
  {
    "id": "apple-of-my-eye-series",
    "name": "Apple Of My Eye Series",
    "releaseDate": "2025-11-20",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "figures",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/4465",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251114_172057_679039____2_apple-of-my-eye-series-figures_blind-boxes_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Wish List",
      "Wishes Come True (Secret)"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1763104604362____wish-list____.png",
      "https://global-static.popmart.com/globalAdmin/1763104679450____secret_wishes-come-true____.png"
    ]
  },
  {
    "id": "the-attic-of-oddities-series-figures",
    "name": "The Attic of Oddities Series Figures",
    "releaseDate": "2026-09-10",
    "releaseYear": 2026,
    "type": "Figure",
    "category": "figures",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/8843",
    "sourceKind": "official",
    "coverImage": "https://prod-global-biz.popmart.com/globalAdmin/1788508283313_101480d2f56b856f68fa152bfb13d1fa.jpg",
    "itemNames": [
      "The Lodger"
    ],
    "itemImages": [
      "https://prod-global-biz.popmart.com/globalAdmin/1788508491820_28194ebf9f3fcb34fbd6bbf6f08ad544.jpg"
    ]
  },
  {
    "id": "hirono-shanghai-pts-limited-figures",
    "name": "Hirono Doll Panda",
    "releaseDate": "2024-10-25",
    "releaseYear": 2024,
    "type": "Figure",
    "category": "figures",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/ca/products/3175/hirono-doll-panda-figure",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20241018_092745_196928____1_____1200x1200.jpg",
    "itemNames": [
      "Hirono Doll Panda"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20241018_092745_196928____1_____1200x1200.jpg"
    ]
  },
  {
    "id": "apple-of-my-eye-series-luminous-pendant",
    "name": "Apple Of My Eye Series Luminous Pendant",
    "releaseDate": "2025-11-20",
    "releaseYear": 2025,
    "type": "Keychain",
    "category": "accessories",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#aaa49b",
      "#5e5a55"
    ],
    "sourceUrl": "https://www.popmart.com/ca/products/4659/apple-of-my-eye-series-luminous-pendant-blind-box-6858",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251114_155238_768263____4_apple-of-my-eye-series-luminous-pendant-blind-box_accessories_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Wish List"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1763105667836____wish-list____.png"
    ]
  },
  {
    "id": "hirono-simper",
    "name": "Hirono Simper Figure",
    "releaseDate": "2024-04-19",
    "releaseYear": 2024,
    "type": "Figure",
    "category": "figures",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/1065/Hirono-Simper-Figure",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20240417_120743_940752__1200x1200.jpg",
    "itemNames": [
      "Hirono Simper Figure"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20240417_120743_940752__1200x1200.jpg"
    ]
  },
  {
    "id": "hand-in-hand-series-phone-chain",
    "name": "Hand In Hand Series Phone Chain",
    "releaseDate": "2025-05-16",
    "releaseYear": 2025,
    "type": "Keychain",
    "category": "accessories",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#aaa49b",
      "#5e5a55"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/2297/hand-in-hand-series-phone-charm-blind-box",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20250512_160029_786390____4_hand-in-hand-series-phone-charm-blind-box_accessories_details_popmart-us_____1200x1200.jpg",
    "itemNames": [
      "Intervals Of Silence"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1747021372760____intervals-of-silence____.png"
    ]
  },
  {
    "id": "dear-birds-series-fridge-magnet",
    "name": "Dear Birds Series Fridge Magnet",
    "releaseDate": "2026-07-23",
    "releaseYear": 2026,
    "type": "Home & Display",
    "category": "accessories",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#aaa49b",
      "#5e5a55"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/6350/dear-birds-series-fridge-magnet-blind-box-8919",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/0bf7d559d1d95d8a6dec2ece136a1c76_____1200x1200.jpg",
    "itemNames": [
      "My Deepest Secret",
      "More Than Words  (Secret)"
    ],
    "itemImages": [
      "https://prod-global-biz.popmart.com/globalAdmin/1778840221822_81ceaba4a23655e2d50b15262fc87bd4.png",
      "https://prod-global-biz.popmart.com/globalAdmin/1778840256692_310ae32fd2a4d1b1305e211e3aa37cf8.png"
    ]
  },
  {
    "id": "hirono-floating-market-figurine",
    "name": "Hirono Floating Market Figurine",
    "releaseDate": "2025-12-20",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "figures",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/zh-hans-MY/products/hirono-floating-market-figure/ad818e5f-7cc4-4805-a008-e35a1fbe6abc",
    "sourceKind": "official",
    "coverImage": "https://prod-eurasian-res.popmart.com/default/20251230_150136_289815____1_____1200x1200.jpg",
    "itemNames": [
      "Hirono Floating Market Figurine"
    ],
    "itemImages": [
      "https://prod-eurasian-res.popmart.com/default/20251230_150136_289815____1_____1200x1200.jpg"
    ]
  },
  {
    "id": "have-a-good-run-series-bracelet",
    "name": "Have A Good Run Series Bracelet",
    "releaseDate": "2026-01-08",
    "releaseYear": 2026,
    "type": "Accessory",
    "category": "accessories",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#aaa49b",
      "#5e5a55"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/5617",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251231_155937_765290____3_have-a-good-run-series-bracelet-blind-box_accessories_details_popmart-us_____1200x1200.jpg",
    "itemNames": [
      "Good Health"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1767166517834____good-health____.png"
    ]
  },
  {
    "id": "apple-of-my-eye-series-mini-bag",
    "name": "Apple Of My Eye Series Mini Bag",
    "releaseDate": "2025-11-20",
    "releaseYear": 2025,
    "type": "Bag & Pouch",
    "category": "accessories",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#aaa49b",
      "#5e5a55"
    ],
    "sourceUrl": "https://www.popmart.com/ca/products/4460",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251117_174208_283960____3_apple-of-my-eye-series-mini-bag-blind-box_accessories_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Wish List"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1763104480335____wish-list____.png"
    ]
  },
  {
    "id": "hirono-living-wild-fight-for-joy-plush-doll",
    "name": "Hirono Living Wild-Fight For Joy Plush Doll",
    "releaseDate": "2025-06-27",
    "releaseYear": 2025,
    "type": "Plush",
    "category": "plush",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#b7aa98",
      "#6f655b"
    ],
    "sourceUrl": "https://www.popmart.com/ca/products/2883",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20250620_181624_019030____3_hirono-living-wild-fight-for-joy-plush-doll_plush-toys_-details_popmart-us_____1200x1200.jpg",
    "itemNames": [
      "Hirono Living Wild-Fight For Joy Plush Doll"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20250620_181624_019030____3_hirono-living-wild-fight-for-joy-plush-doll_plush-toys_-details_popmart-us_____1200x1200.jpg"
    ]
  },
  {
    "id": "hirono-listening-saying-seeing-figurine",
    "name": "Hirono Listening, Saying, Seeing Figurine",
    "releaseDate": "2023-11-05",
    "releaseYear": 2023,
    "type": "Figure",
    "category": "figures",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/3172/hirono-listening-saying-seeing-figure-set",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20231102_155828_300333__1200x1200.jpg",
    "itemNames": [
      "Listening",
      "Saying",
      "Seeing"
    ],
    "itemImages": [
      "/artwork/hirono-listening-saying-seeing-figurine/saying.png",
      "/artwork/hirono-listening-saying-seeing-figurine/listening.png",
      "/artwork/hirono-listening-saying-seeing-figurine/seeing.png"
    ]
  },
  {
    "id": "have-a-good-run-series-fridge-magnet",
    "name": "Have A Good Run Series Fridge Magnet",
    "releaseDate": "2026-01-08",
    "releaseYear": 2026,
    "type": "Home & Display",
    "category": "accessories",
    "collectionType": "blind-box",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#aaa49b",
      "#5e5a55"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/5614/have-a-good-run-series-fridge-magnet-blind-box-8092",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251231_154211_473733____2_have-a-good-run-series-fridge-magnet-blind-box_accessories_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Good Health"
    ],
    "itemImages": [
      "https://global-static.popmart.com/globalAdmin/1767165965703____good-health____.png"
    ]
  },
  {
    "id": "hirono-the-pianist-figurine",
    "name": "Hirono The Pianist Figurine",
    "releaseDate": "2025-05-30",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "figures",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/2237/hirono-the-pianist-figure",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20250523_172227_605184____2_hirono-the-pianist-figure_figurine_details_popmart-us_____1200x1200.jpg",
    "itemNames": [
      "Hirono The Pianist Figurine"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20250523_172227_605184____2_hirono-the-pianist-figure_figurine_details_popmart-us_____1200x1200.jpg"
    ]
  },
  {
    "id": "hirono-behind-time-figurine",
    "name": "Hirono Behind Time Figurine",
    "releaseDate": "2026-06-04",
    "releaseYear": 2026,
    "type": "Figure",
    "category": "figures",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/6267/hirono-behind-time-figure",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20260424_174821_582979____1_hirono-behind-time-figure_figurine_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Hirono Behind Time Figurine"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20260424_174821_582979____1_hirono-behind-time-figure_figurine_details_pop-mart-us_____1200x1200.jpg"
    ]
  },
  {
    "id": "hirono-after-dark-series-mugs",
    "name": "Hirono After Dark Series Mugs",
    "releaseDate": "2026-09-03",
    "releaseYear": 2026,
    "type": "Home & Display",
    "category": "accessories",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#aaa49b",
      "#5e5a55"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/8771/Hirono%20After%20Dark%20Series%20-%20Mugs",
    "sourceKind": "official",
    "coverImage": "https://prod-global-biz.popmart.com/globalAdmin/1787911836879_16d0a49a6521fdf94a1a1b29c924dcc6.jpg",
    "itemNames": [
      "Graffiti Mug White",
      "Ghost Mug Black"
    ],
    "itemImages": [
      "/artwork/hirono-after-dark-series-mugs/white.png",
      "/artwork/hirono-after-dark-series-mugs/black.png"
    ]
  },
  {
    "id": "hirono-stefanie-sun-aut-nihilo-figurine",
    "name": "Hirono × Stefanie Sun Aut Nihilo Figurine",
    "releaseDate": "2025-10-23",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "collaborations",
    "collectionType": "standalone",
    "collaboration": "Stefanie Sun",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/4041/hirono-%C3%97-stefanie-sun-aut-nihilo-figure",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251017_175629_695163____2_hirono-stefanie-sun-aut-nihilo-figure_figurine_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Hirono × Stefanie Sun Aut Nihilo Figurine"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20251017_175629_695163____2_hirono-stefanie-sun-aut-nihilo-figure_figurine_details_pop-mart-us_____1200x1200.jpg"
    ]
  },
  {
    "id": "hirono-searching-for-aliens-figurine",
    "name": "Hirono Searching for Aliens Figurine",
    "releaseDate": "2025-08-28",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "figures",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/3457/hirono-search-for-aliens-figurine",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20250822_173726_491186____4_hirono-search-for-aliens-figurine_figurine_popmart-us_____1200x1200.jpg",
    "itemNames": [
      "Hirono Searching for Aliens Figurine"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20250822_173726_491186____4_hirono-search-for-aliens-figurine_figurine_popmart-us_____1200x1200.jpg"
    ]
  },
  {
    "id": "hirono-after-dark-series-upside-down-ambient-light",
    "name": "Hirono After Dark Series UPSIDE DOWN Ambient Light",
    "releaseDate": "2026-09-03",
    "releaseYear": 2026,
    "type": "Home & Display",
    "category": "accessories",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#aaa49b",
      "#5e5a55"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/8752",
    "sourceKind": "official",
    "coverImage": "https://prod-global-biz.popmart.com/globalAdmin/1787911416407_c3be39fd6b58b2cb7ac966f96d7627b0.jpg",
    "itemNames": [
      "Hirono After Dark Series UPSIDE DOWN Ambient Light"
    ],
    "itemImages": [
      "https://prod-global-biz.popmart.com/globalAdmin/1787911416407_c3be39fd6b58b2cb7ac966f96d7627b0.jpg"
    ]
  },
  {
    "id": "hirono-stefanie-sun-weather-with-you-figurine",
    "name": "Hirono × Stefanie Sun Weather With You Figurine",
    "releaseDate": "2025-10-23",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "collaborations",
    "collectionType": "standalone",
    "collaboration": "Stefanie Sun",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/4040",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251017_175042_764673____3_hirono-stefanie-sun-weather-with-you-figurine_figurine_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Hirono × Stefanie Sun Weather With You Figurine"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20251017_175042_764673____3_hirono-stefanie-sun-weather-with-you-figurine_figurine_details_pop-mart-us_____1200x1200.jpg"
    ]
  },
  {
    "id": "hirono-leah-dou-airborne-figurine",
    "name": "Hirono × Leah Dou Airborne Figurine",
    "releaseDate": "2026-06-25",
    "releaseYear": 2026,
    "type": "Figure",
    "category": "collaborations",
    "collectionType": "standalone",
    "collaboration": "Leah Dou",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/7883",
    "sourceKind": "official",
    "coverImage": "https://prod-global-biz.popmart.com/globalAdmin/1781861722735_5fb464173c3fc7e93896b82e6cf20de8.jpg",
    "itemNames": [
      "Hirono × Leah Dou Airborne Figurine"
    ],
    "itemImages": [
      "https://prod-global-biz.popmart.com/globalAdmin/1781861722735_5fb464173c3fc7e93896b82e6cf20de8.jpg"
    ]
  },
  {
    "id": "celebrating-the-moment-series-bag",
    "name": "Celebrating The Moment Series Bag",
    "releaseDate": "2025-10-23",
    "releaseYear": 2025,
    "type": "Bag & Pouch",
    "category": "accessories",
    "collectionType": "standalone",
    "tags": [
      "mixed-ip"
    ],
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#aaa49b",
      "#5e5a55"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/4046",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251017_180638_713610____3_celebrating-the-moment-series-bag_accessories_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Celebrating The Moment Series Bag"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20251017_180638_713610____3_celebrating-the-moment-series-bag_accessories_details_pop-mart-us_____1200x1200.jpg"
    ]
  },
  {
    "id": "hirono-chucky-figurine",
    "name": "Hirono × Chucky Figurine",
    "releaseDate": "2025-12-25",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "collaborations",
    "collectionType": "standalone",
    "collaboration": "Chucky",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/ca/products/5619/hirono-%C3%97-chucky-figurine",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251219_164430_103069____scene_2_-hirono-chucky-figurine_figurine_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Hirono × Chucky Figurine"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20251219_164430_103069____scene_2_-hirono-chucky-figurine_figurine_details_pop-mart-us_____1200x1200.jpg"
    ]
  },
  {
    "id": "hirono-dead-silence-figurine",
    "name": "Hirono × Dead Silence Figurine",
    "releaseDate": "2025-11-27",
    "releaseYear": 2025,
    "type": "Figure",
    "category": "collaborations",
    "collectionType": "standalone",
    "collaboration": "Dead Silence",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/4504/Hirono-%C3%97-Dead-Silence-Figure",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20251121_154650_908751____scene_1_hirono-dead-silence-figure_figurine_details_pop-mart-us_____1200x1200.jpg",
    "itemNames": [
      "Hirono × Dead Silence Figurine"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20251121_154650_908751____scene_1_hirono-dead-silence-figure_figurine_details_pop-mart-us_____1200x1200.jpg"
    ]
  },
  {
    "id": "hirono-reshape-large-figure",
    "name": "Hirono Reshape",
    "releaseDate": "2024-04-19",
    "releaseYear": 2024,
    "type": "Figure",
    "category": "figures",
    "collectionType": "standalone",
    "description": "A HIRONO collectible verified against a live official POP MART product page.",
    "palette": [
      "#a99987",
      "#5f554d"
    ],
    "sourceUrl": "https://www.popmart.com/us/products/1066/Hirono-Reshape-Figurine",
    "sourceKind": "official",
    "coverImage": "https://prod-america-res.popmart.com/default/20240417_120208_907519__1200x1200.jpg",
    "itemNames": [
      "Hirono Reshape"
    ],
    "itemImages": [
      "https://prod-america-res.popmart.com/default/20240417_120208_907519__1200x1200.jpg"
    ]
  }
];

  const coreCatalog = [
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
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
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
      type: "Figure Series",
      category: "collaborations",
      collectionType: "blind-box",
      collaboration: "Le Petit Prince",
      description: "Hirono wanders through Antoine de Saint-Exupéry's beloved little universe.",
      palette: ["#8fa5b2", "#d1a86e"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
      itemNames: ["The Little Prince", "The Rose", "The King", "The Conceited Man", "The Tippler", "The Businessman", "The Lamplighter", "The Geographer", "The Snake", "The Fox", "The Switchman", "The Merchant", "The Little Prince (Special)", "The Pilot (Secret)"]
    }),
    release({
      id: "hirono-clot",
      name: "Hirono × CLOT Series",
      releaseDate: "2024-12-13",
      type: "Figure Series",
      category: "collaborations",
      collectionType: "blind-box",
      collaboration: "CLOT",
      description: "A six-piece meeting of HIRONO's weathered charm and CLOT's streetwear language.",
      palette: ["#aa6c59", "#553d37"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
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
      itemNames: ["Little Hare — Regular Version", "Little Hare — Special Version (Special)"],
      itemImages: [
        "/artwork/hirono-little-hare-plush/regular.png",
        "/artwork/hirono-little-hare-plush/special.png"
      ]
    }),
    release({
      id: "hirono-mist-walker",
      name: "Mist-Walker Plush Pendant Series",
      releaseDate: "2026-07-23",
      type: "Plush Series",
      category: "plush",
      collectionType: "blind-box",
      description: "Seven spectral plush companions wandering through wings, shadow and soft silver mist.",
      palette: ["#9ca1a3", "#555d62"],
      sourceUrl: "https://www.popmart.com/us/collection/4/hirono",
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
      type: "Standalone Figure",
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
      type: "Figure Series",
      category: "collaborations",
      collectionType: "blind-box",
      collaboration: "Harry Potter",
      description: "A magical HIRONO collaboration featuring characters from Harry Potter, released October 8, 2026.",
      palette: ["#776856", "#3f3a36"],
      sourceUrl: "https://www.popmart.com/us/products/9119/hirono-%C3%97-harry-potter-series-figures",
      itemNames: [
        "Albus Dumbledore",
        "Rubeus Hagrid",
        "Harry Potter and The Sorting Hat",
        "Draco Malfoy",
        "Severus Snape",
        "Dobby",
        "Sirius Black",
        "Harry Potter and Quidditch",
        "Ron Weasley",
        "Luna Lovegood",
        "Harry Potter and Hedwig",
        "Lord Voldemort",
        "Mandrake (Secret)",
        "Harry Potter — Special Edition (Super Secret)"
      ],
      itemImages: [
        "https://prod-global-biz.popmart.com/globalAdmin/1790326314265_1e63d407887951ce5e91b6aca575abc4.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326338734_605b847a2fc3c64ce20c97eac675c47a.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326348562_ee4b12fc5010509ad569e9b3eeccb0ae.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326373060_cd8d9a5c8eef3e87a16753584d448733.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326389178_66bd6005d483cc2711b8fcacd866c420.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326403748_0805bebb2c2fea8502733b0bdd268b4c.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326416799_1f627be0466742779322f4b3b651dd0e.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326461639_bca4f65b058a87e2cd27eed988894755.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326480883_cb8561e3f74ee1e626e4450b9a817621.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326491106_2845ec20f66839cf5485a3bd5042996d.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326505272_d583f5335334ad04635418a1f720acb4.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790326528849_91eac5658fc1a6935d310a07149aef59.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790751967100_5f32bdbd17e3b11c49dc31771f255bca.jpg",
        "https://prod-global-biz.popmart.com/globalAdmin/1790751969536_e2dea29bee5b2b187357e0b3a32f436a.jpg"
      ],
      secretOdds: "TBA"
    }),
    release({
      id: "hirono-snowman",
      name: "Hirono Snowman Figurine",
      releaseDate: "2026-10-22",
      type: "Figure",
      category: "figures",
      collectionType: "standalone",
      status: "upcoming",
      description: "A snowman-themed HIRONO figurine, approximately 15 cm tall, in ABS, PVC, and polyamide. Official US online release: October 22, 2026.",
      palette: ["#ece7df", "#77746e"],
      sourceUrl: "https://www.popmart.com/us/products/9302/hirono-snowman-figurine",
      coverImage: "https://prod-global-biz.popmart.com/globalAdmin/1792139273832_2fe14cbe6691770b86465860d009c38a.jpg",
      itemNames: ["Snowman"],
      itemImages: ["https://prod-global-biz.popmart.com/globalAdmin/1792139273832_2fe14cbe6691770b86465860d009c38a.jpg"]
    })
  ];

  export const catalog = [...coreCatalog, ...popMartVerifiedReleaseData.map(release)].sort((a, b) => {
    if (a.releaseDate && b.releaseDate) return a.releaseDate.localeCompare(b.releaseDate);
    if (a.releaseDate) return -1;
    if (b.releaseDate) return 1;
    if (a.year && b.year && a.year !== b.year) return a.year - b.year;
    if (a.year) return -1;
    if (b.year) return 1;
    return a.name.localeCompare(b.name);
  });
