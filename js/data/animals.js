export const CONSERVATION_MULTIPLIERS = {
  'LC': { label: 'Least Concern', multiplier: 1.0, color: '#4caf50' },
  'NT': { label: 'Near Threatened', multiplier: 1.25, color: '#8bc34a' },
  'VU': { label: 'Vulnerable', multiplier: 1.5, color: '#fbc02d' },
  'EN': { label: 'Endangered', multiplier: 2.0, color: '#f57c00' },
  'CR': { label: 'Critically Endangered', multiplier: 3.0, color: '#d32f2f' }
};

export const ANIMALS = [
  {
    id: 'honeybee',
    name: 'Bella the Honeybee',
    species: 'Western Honeybee (Apis mellifera)',
    emoji: '\u{1F41D}',
    conservationStatus: 'NT',
    difficulty: 1,
    ailment: {
      name: 'Wing Fatigue',
      description: 'Bella has been flying too long and her wings are weak! She needs your help to recover.',
      symptoms: ['Drooping wings', 'Slow buzzing', "Can't lift pollen"],
      correctTreatments: ['Nectar energy drink', 'Wing rest wrap', 'Flower pollen vitamins', 'Honey boost', 'Royal jelly drops', 'Sunflower extract'],
      wrongTreatments: ['Ice bath', 'Loud music', 'Spicy peppers', 'Rubber gloves', 'Battery acid', 'Motor oil'],
      symptomTreatmentPairs: [
        { symptom: 'Drooping wings', treatment: 'Wing rest wrap' },
        { symptom: 'Slow buzzing', treatment: 'Nectar energy drink' },
        { symptom: "Can't lift pollen", treatment: 'Flower pollen vitamins' },
        { symptom: 'Low energy', treatment: 'Honey boost' },
        { symptom: 'Dry wings', treatment: 'Royal jelly drops' },
        { symptom: 'Weak antennae', treatment: 'Sunflower extract' }
      ]
    },
    minigameConfigs: {
      matchPairs: { pairs: 6, timeLimit: 60 },
      matchThree: { gridSize: 6, timeLimit: 90, targetScore: 400, tileTypes: 5 },
      dragDrop: { rounds: 4, timeLimit: 75, itemsPerRound: 4 },
      germZapper: { gridSize: 4, timeLimit: 60, targetZaps: 15, spawnInterval: 1400, germLifetime: 2200, maxGerms: 2 },
      simonSays: { buttonCount: 4, timeLimit: 60, startLength: 2, maxRounds: 6 },
      sliderPuzzle: { gridSize: 3, timeLimit: 90 },
      wordScramble: { rounds: 4, timeLimit: 75 },
      rhythmGame: { bpm: 70, timeLimit: 60, targetBeats: 15, hitWindow: 300 },
      spotDifference: { differences: 4, rounds: 3, timeLimit: 70 }
    },
    journal: {
      habitat: 'Found on every continent except Antarctica. They live in hives in hollow trees, rock crevices, and man-made beehives. A single hive can contain 20,000 to 80,000 bees.',
      diet: 'Nectar and pollen from flowers. A single bee visits 50 to 1,000 flowers per day and can carry pollen equal to 80% of its body weight.',
      conservationInfo: 'Bee populations are declining worldwide due to pesticides, habitat loss, climate change, and disease. They pollinate about 75% of the world\'s flowering plants and are essential for food production.',
      threats: ['Pesticides (especially neonicotinoids)', 'Habitat loss', 'Varroa destructor mites', 'Climate change', 'Colony Collapse Disorder'],
      funFacts: [
        'A honeybee can fly up to 15 miles per hour and visits 50-1,000 flowers per day.',
        'Bees communicate by dancing! The "waggle dance" tells other bees where food is located.',
        'A single bee produces only about 1/12th of a teaspoon of honey in its entire lifetime.',
        'Honeybees have five eyes \u2014 two large compound eyes and three small ones on top of their head.',
        'A queen bee can lay up to 2,000 eggs per day.'
      ]
    }
  },
  {
    id: 'panda',
    name: 'Ping the Giant Panda',
    species: 'Giant Panda (Ailuropoda melanoleuca)',
    emoji: '\u{1F43C}',
    conservationStatus: 'VU',
    difficulty: 2,
    ailment: {
      name: 'Bamboo Belly Ache',
      description: 'Ping ate some bad bamboo and has a terrible stomach ache! Help soothe his tummy.',
      symptoms: ['Holding tummy', 'Not eating', 'Low energy', 'Sad eyes'],
      correctTreatments: ['Herbal tea', 'Fresh bamboo shoots', 'Tummy medicine', 'Ginger root extract', 'Probiotic drops', 'Warm compress'],
      wrongTreatments: ['Chocolate', 'Soda pop', 'Jumping jacks', 'Hot sauce', 'Bubble gum', 'Energy drink'],
      symptomTreatmentPairs: [
        { symptom: 'Holding tummy', treatment: 'Warm compress' },
        { symptom: 'Not eating', treatment: 'Fresh bamboo shoots' },
        { symptom: 'Low energy', treatment: 'Ginger root extract' },
        { symptom: 'Sad eyes', treatment: 'Herbal tea' },
        { symptom: 'Bloated belly', treatment: 'Tummy medicine' },
        { symptom: 'Gurgling stomach', treatment: 'Probiotic drops' }
      ]
    },
    minigameConfigs: {
      matchPairs: { pairs: 6, timeLimit: 55 },
      matchThree: { gridSize: 6, timeLimit: 90, targetScore: 500, tileTypes: 5 },
      dragDrop: { rounds: 5, timeLimit: 75, itemsPerRound: 4 },
      germZapper: { gridSize: 4, timeLimit: 60, targetZaps: 18, spawnInterval: 1200, germLifetime: 2000, maxGerms: 3 },
      simonSays: { buttonCount: 4, timeLimit: 65, startLength: 2, maxRounds: 7 },
      sliderPuzzle: { gridSize: 3, timeLimit: 80 },
      wordScramble: { rounds: 5, timeLimit: 75 },
      rhythmGame: { bpm: 80, timeLimit: 60, targetBeats: 18, hitWindow: 270 },
      spotDifference: { differences: 5, rounds: 3, timeLimit: 65 }
    },
    journal: {
      habitat: 'Temperate broadleaf and mixed forests of central China, mainly in Sichuan, Shaanxi, and Gansu provinces. They live at elevations of 5,000 to 10,000 feet.',
      diet: '99% bamboo! They eat 26 to 84 pounds of bamboo daily. Despite being classified as carnivores, they occasionally eat small rodents, pikas, or fish.',
      conservationInfo: 'Giant pandas were reclassified from Endangered to Vulnerable in 2016 thanks to decades of conservation efforts. About 1,864 remain in the wild, with over 60 nature reserves protecting them.',
      threats: ['Habitat fragmentation from roads and development', 'Naturally low birth rate', 'Climate change affecting bamboo growth', 'Small, isolated populations'],
      funFacts: [
        'Pandas spend 10 to 16 hours a day eating. That is a LOT of bamboo!',
        'A newborn panda is about the size of a stick of butter \u2014 tiny compared to its mother.',
        'Despite being classified as carnivores, 99% of their diet is bamboo.',
        'Pandas have a special "pseudo-thumb" \u2014 an enlarged wrist bone \u2014 that helps them grip bamboo.',
        'Giant pandas do not hibernate because bamboo does not provide enough energy to build fat reserves.'
      ]
    }
  },
  {
    id: 'seaTurtle',
    name: 'Shelly the Sea Turtle',
    species: 'Green Sea Turtle (Chelonia mydas)',
    emoji: '\u{1F422}',
    conservationStatus: 'EN',
    difficulty: 3,
    ailment: {
      name: 'Plastic Tangle',
      description: 'Shelly got tangled in plastic waste and has cuts on her flippers! Carefully help free her.',
      symptoms: ['Tangled flippers', 'Small cuts', 'Trouble swimming', 'Exhaustion'],
      correctTreatments: ['Gentle bandages', 'Saltwater rinse', 'Seaweed wrap', 'Antiseptic cream', 'Rest in warm pool', 'Vitamin supplements'],
      wrongTreatments: ['Super glue', 'Hair dryer', 'Rubber bands', 'Sandpaper', 'Perfume', 'Tape'],
      symptomTreatmentPairs: [
        { symptom: 'Tangled flippers', treatment: 'Gentle bandages' },
        { symptom: 'Small cuts', treatment: 'Antiseptic cream' },
        { symptom: 'Trouble swimming', treatment: 'Rest in warm pool' },
        { symptom: 'Exhaustion', treatment: 'Vitamin supplements' },
        { symptom: 'Irritated skin', treatment: 'Saltwater rinse' },
        { symptom: 'Dehydrated shell', treatment: 'Seaweed wrap' }
      ]
    },
    minigameConfigs: {
      matchPairs: { pairs: 7, timeLimit: 55 },
      matchThree: { gridSize: 6, timeLimit: 80, targetScore: 550, tileTypes: 5 },
      dragDrop: { rounds: 5, timeLimit: 75, itemsPerRound: 4 },
      germZapper: { gridSize: 4, timeLimit: 55, targetZaps: 20, spawnInterval: 1100, germLifetime: 1800, maxGerms: 3 },
      simonSays: { buttonCount: 5, timeLimit: 60, startLength: 2, maxRounds: 7 },
      sliderPuzzle: { gridSize: 3, timeLimit: 70 },
      wordScramble: { rounds: 5, timeLimit: 70 },
      rhythmGame: { bpm: 90, timeLimit: 55, targetBeats: 20, hitWindow: 250 },
      spotDifference: { differences: 5, rounds: 3, timeLimit: 60 }
    },
    journal: {
      habitat: 'Tropical and subtropical oceans worldwide. They nest on beaches in over 80 countries and migrate thousands of miles between feeding grounds and nesting sites.',
      diet: 'Adults are mostly herbivorous, eating seagrass and algae. Juveniles also eat jellyfish, crabs, sponges, and other invertebrates.',
      conservationInfo: 'Threatened by plastic pollution, fishing bycatch, poaching, and coastal development destroying nesting beaches. Some populations are recovering thanks to beach protection programs and fishing regulations.',
      threats: ['Plastic pollution (they mistake bags for jellyfish)', 'Fishing net bycatch', 'Egg poaching', 'Coastal development on nesting beaches', 'Climate change warming sand and skewing sex ratios'],
      funFacts: [
        'Sea turtles can hold their breath for up to 5 hours while sleeping underwater.',
        'They navigate using Earth\'s magnetic field and can return to the exact beach where they were born to lay eggs.',
        'Green sea turtles are named for the green color of their fat (from eating algae), not their shell!',
        'Sea turtles have been around for over 100 million years \u2014 they outlived the dinosaurs.',
        'The temperature of the sand determines whether baby turtles are male or female.'
      ]
    }
  },
  {
    id: 'snowLeopard',
    name: 'Storm the Snow Leopard',
    species: 'Snow Leopard (Panthera uncia)',
    emoji: '\u{1F406}',
    conservationStatus: 'VU',
    difficulty: 4,
    ailment: {
      name: 'Frostbitten Paw',
      description: 'Storm got caught in a blizzard and has a frostbitten paw! Help warm and heal it.',
      symptoms: ['Limping', 'Swollen paw', 'Shivering', 'Whimpering'],
      correctTreatments: ['Warm compress', 'Healing salve', 'Cozy bandage', 'Gentle massage', 'Warm milk', 'Anti-inflammatory drops', 'Soft paw pad', 'Warming blanket'],
      wrongTreatments: ['Ice pack', 'Hot sauce', 'Running shoes', 'Hair gel', 'Cold water', 'Sandpaper', 'Chili powder', 'Frozen fish'],
      symptomTreatmentPairs: [
        { symptom: 'Limping', treatment: 'Soft paw pad' },
        { symptom: 'Swollen paw', treatment: 'Healing salve' },
        { symptom: 'Shivering', treatment: 'Warming blanket' },
        { symptom: 'Whimpering', treatment: 'Gentle massage' },
        { symptom: 'Cracked pads', treatment: 'Warm compress' },
        { symptom: 'Stiff joints', treatment: 'Anti-inflammatory drops' }
      ]
    },
    minigameConfigs: {
      matchPairs: { pairs: 8, timeLimit: 50 },
      matchThree: { gridSize: 7, timeLimit: 70, targetScore: 650, tileTypes: 5 },
      dragDrop: { rounds: 5, timeLimit: 65, itemsPerRound: 4 },
      germZapper: { gridSize: 5, timeLimit: 50, targetZaps: 22, spawnInterval: 1000, germLifetime: 1600, maxGerms: 4 },
      simonSays: { buttonCount: 5, timeLimit: 55, startLength: 3, maxRounds: 8 },
      sliderPuzzle: { gridSize: 4, timeLimit: 90 },
      wordScramble: { rounds: 5, timeLimit: 65 },
      rhythmGame: { bpm: 100, timeLimit: 50, targetBeats: 22, hitWindow: 220 },
      spotDifference: { differences: 6, rounds: 3, timeLimit: 55 }
    },
    journal: {
      habitat: 'High mountain ranges of Central Asia, including the Himalayas, Altai, and Hindu Kush, at elevations of 9,800 to 14,800 feet. They prefer steep, rugged terrain with rocky outcrops.',
      diet: 'Blue sheep (bharal), Siberian ibex, marmots, pikas, hares, and game birds. A snow leopard can take down prey three times its own weight.',
      conservationInfo: 'An estimated 4,000 to 7,500 remain in the wild across 12 countries. They are called the "ghost of the mountains" because they are so rarely seen. Conservation programs work with local herders to reduce human-wildlife conflict.',
      threats: ['Poaching for fur and bones', 'Retaliatory killing by livestock herders', 'Habitat loss from mining and overgrazing', 'Climate change shrinking alpine habitat', 'Decline of prey species'],
      funFacts: [
        'Snow leopards cannot roar! They make a sound called a "chuff" or "prusten" instead.',
        'Their tails are nearly as long as their bodies and are used for balance \u2014 and as a cozy face blanket in cold weather.',
        'They can leap up to 50 feet (15 meters) in a single bound across mountain gaps.',
        'Their huge, furry paws act like natural snowshoes, preventing them from sinking into snow.',
        'Snow leopards are so elusive that scientists sometimes call them the "ghost cat."'
      ]
    }
  },
  {
    id: 'axolotl',
    name: 'Axel the Axolotl',
    species: 'Axolotl (Ambystoma mexicanum)',
    emoji: '\u{1F98E}',
    conservationStatus: 'CR',
    difficulty: 5,
    ailment: {
      name: 'Gill Infection',
      description: "Axel's beautiful feathery gills are infected from polluted water! He needs urgent care.",
      symptoms: ['Pale gills', 'Slow movement', 'Floating sideways', 'Loss of appetite'],
      correctTreatments: ['Clean water filter', 'Gill medicine drops', 'Mineral bath', 'Algae supplement', 'Water conditioner', 'Probiotic powder', 'Oxygen bubbles', 'Herbal gill wash'],
      wrongTreatments: ['Soap', 'Perfume', 'Hot water', 'Bleach', 'Vinegar', 'Hair spray', 'Glitter', 'Salt water'],
      symptomTreatmentPairs: [
        { symptom: 'Pale gills', treatment: 'Gill medicine drops' },
        { symptom: 'Slow movement', treatment: 'Mineral bath' },
        { symptom: 'Floating sideways', treatment: 'Water conditioner' },
        { symptom: 'Loss of appetite', treatment: 'Algae supplement' },
        { symptom: 'Cloudy water', treatment: 'Clean water filter' },
        { symptom: 'Low oxygen levels', treatment: 'Oxygen bubbles' }
      ]
    },
    minigameConfigs: {
      matchPairs: { pairs: 8, timeLimit: 45 },
      matchThree: { gridSize: 7, timeLimit: 60, targetScore: 800, tileTypes: 6 },
      dragDrop: { rounds: 6, timeLimit: 60, itemsPerRound: 4 },
      germZapper: { gridSize: 5, timeLimit: 45, targetZaps: 25, spawnInterval: 900, germLifetime: 1400, maxGerms: 4 },
      simonSays: { buttonCount: 6, timeLimit: 50, startLength: 3, maxRounds: 8 },
      sliderPuzzle: { gridSize: 4, timeLimit: 75 },
      wordScramble: { rounds: 6, timeLimit: 60 },
      rhythmGame: { bpm: 110, timeLimit: 45, targetBeats: 25, hitWindow: 200 },
      spotDifference: { differences: 7, rounds: 3, timeLimit: 50 }
    },
    journal: {
      habitat: 'Lake Xochimilco in the Valley of Mexico. Once found throughout multiple lakes near Mexico City, they are now restricted to a small network of canals and wetlands.',
      diet: 'Worms, insects, small fish, and anything small enough to fit in their mouths. They suck in food like a vacuum \u2014 they have tiny, almost useless teeth.',
      conservationInfo: 'Critically Endangered with only an estimated 50 to 1,000 adults remaining in the wild. Wild populations dropped over 80% in under two decades. Paradoxically, millions exist in captivity as pets and laboratory animals worldwide.',
      threats: ['Urban expansion of Mexico City', 'Severe water pollution', 'Invasive tilapia and carp eating eggs and competing for food', 'Habitat drainage for agriculture', 'Disease from captive-bred individuals'],
      funFacts: [
        'Axolotls can regenerate entire limbs, their heart, brain, spinal cord, and even parts of their eyes!',
        'They are "neotenic" \u2014 they keep their larval features (like gills) their whole life and never fully grow up.',
        'The Aztecs named them after Xolotl, their god of fire, lightning, and death.',
        'An axolotl can regrow the same limb up to 5 times with perfect accuracy.',
        'Scientists study axolotls hoping to unlock the secret of regeneration for human medicine.'
      ]
    }
  }
];

export function getAnimalById(id) {
  return ANIMALS.find(a => a.id === id);
}

export function getConservationInfo(status) {
  return CONSERVATION_MULTIPLIERS[status] || CONSERVATION_MULTIPLIERS['LC'];
}
