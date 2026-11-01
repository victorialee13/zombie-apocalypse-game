import type { DayEvent, NameOf } from "./events";
import { EVERYONE } from "./survivors";

// Days without a written event draw one of these at random, never repeating within a run
export const RANDOM_EVENTS: ((name: NameOf) => DayEvent)[] = [
  (name) => ({
    title: "Supply Drop",
    story:
      "A plane nobody has heard in weeks passes low over the city. A crate on a red parachute drifts down onto a rooftop three blocks north. Everyone else in the city saw it too.",
    choices: [
      {
        title: "Race for it",
        description: `${name("Scout")} runs the rooftops and tries to get there first.`,
        lead: "Scout",
        outcomes: [
          {
            kind: "success",
            chance: 45,
            text: `${name("Scout")} got there first and lowered the whole crate down on a rope. Food, water, and a box of rounds.`,
            supplies: { food: 18, water: 15, ammo: 9 },
          },
          {
            kind: "mixed",
            chance: 35,
            text: `${name("Scout")} got there second. There was a scuffle, and they came back with half the crate and a split lip.`,
            supplies: { food: 9, water: 8 },
            survivors: [{ role: "Scout", health: -15 }],
          },
          {
            kind: "failure",
            chance: 20,
            text: `The roof gave way under ${name("Scout")}. They limped home with nothing.`,
            survivors: [{ role: "Scout", health: -30, status: "Injured" }],
          },
        ],
      },
      {
        title: "Send an armed team",
        description: `${name("Ex-Soldier")} leads a group with rifles. Slower, but nobody will take it from them.`,
        lead: "Ex-Soldier",
        cost: { ammo: -8 },
        outcomes: [
          {
            kind: "success",
            chance: 55,
            text: "Two warning shots and the other scavengers scattered. The team brought the whole crate home.",
            supplies: { food: 18, water: 18 },
          },
          {
            kind: "mixed",
            chance: 35,
            text: `The crate had split open in the fall. ${name("Ex-Soldier")}’s team salvaged what was left.`,
            supplies: { food: 11, water: 9 },
          },
          {
            kind: "failure",
            chance: 10,
            text: `The gunfire drew a crowd of the dead. ${name("Ex-Soldier")} covered the retreat and paid for it.`,
            supplies: { food: 5 },
            survivors: [{ role: "Ex-Soldier", health: -25, status: "Injured" }],
          },
        ],
      },
      {
        title: "Let it go",
        description: "Whoever gets there first will have to fight for it. Not worth a life.",
        outcomes: [
          {
            kind: "mixed",
            chance: 100,
            text: "You hear shooting from the north all afternoon. By evening it stops. Nobody here got hurt.",
          },
        ],
      },
    ],
  }),

  (name) => ({
    title: "Storm Coming",
    story:
      "The sky over the river has gone the color of a bruise. A real storm is rolling in, the first in a month. Rain means water, if you can catch it.",
    choices: [
      {
        title: "Rig the roof",
        description: `${name("Engineer")} wants to run tarps and gutters into the old water tanks. It means working on the roof in the wind.`,
        lead: "Engineer",
        outcomes: [
          {
            kind: "success",
            chance: 55,
            text: `${name("Engineer")}’s gutters worked perfectly. The tanks are full for the first time since the outbreak.`,
            supplies: { water: 27 },
          },
          {
            kind: "mixed",
            chance: 35,
            text: `Half the tarps tore loose, but the rest held. ${name("Engineer")} slipped on the wet roof and is sore.`,
            supplies: { water: 15 },
            survivors: [{ role: "Engineer", health: -10 }],
          },
          {
            kind: "failure",
            chance: 10,
            text: `A gust took the tarp and ${name("Engineer")} with it. They caught the railing, barely.`,
            supplies: { water: 5 },
            survivors: [{ role: "Engineer", health: -25, status: "Injured" }],
          },
        ],
      },
      {
        title: "Put out every pot",
        description: "Every bucket, pan, and bottle goes out on the windowsills. Safe, but you’ll catch less.",
        outcomes: [
          {
            kind: "success",
            chance: 40,
            text: "It poured all night. Every container was overflowing by morning.",
            supplies: { water: 15 },
          },
          {
            kind: "mixed",
            chance: 60,
            text: "The storm mostly passed to the south. You caught what you could.",
            supplies: { water: 9 },
          },
        ],
      },
    ],
  }),

  (name) => ({
    title: "The Corner Store",
    story:
      "Through the binoculars, the corner store across the street looks untouched behind its metal shutter. Something moved inside last night, though.",
    choices: [
      {
        title: "Clear it out",
        description: `${name("Guard")} breaks the shutter and clears the store aisle by aisle.`,
        lead: "Guard",
        cost: { ammo: -8 },
        outcomes: [
          {
            kind: "success",
            chance: 50,
            text: `Only two of them inside, and ${name("Guard")} dealt with both. The back room was stacked with canned food.`,
            supplies: { food: 24 },
          },
          {
            kind: "mixed",
            chance: 35,
            text: `More inside than anyone expected. ${name("Guard")} got the food out but got clawed doing it.`,
            supplies: { food: 15 },
            survivors: [{ role: "Guard", health: -15 }],
          },
          {
            kind: "failure",
            chance: 15,
            text: `The store was a nest. ${name("Guard")} barely made it back across the street.`,
            supplies: { food: 5 },
            survivors: [{ role: "Guard", health: -30, status: "Injured" }],
          },
        ],
      },
      {
        title: "Quick grab at dawn",
        description: `${name("Scout")} squeezes under the shutter, takes what’s near the door, and runs.`,
        lead: "Scout",
        outcomes: [
          {
            kind: "success",
            chance: 45,
            text: `${name("Scout")} was in and out in two minutes with a full backpack.`,
            supplies: { food: 15 },
          },
          {
            kind: "mixed",
            chance: 40,
            text: `${name("Scout")} grabbed a few cans before something stirred in the back.`,
            supplies: { food: 8 },
            survivors: [{ role: "Scout", status: "Exhausted" }],
          },
          {
            kind: "failure",
            chance: 15,
            text: `${name("Scout")} got caught under the shutter on the way out and tore their leg open.`,
            survivors: [{ role: "Scout", health: -25, status: "Injured" }],
          },
        ],
      },
      {
        title: "Leave it alone",
        description: `${name("Cook")} stretches what’s left instead.`,
        outcomes: [
          {
            kind: "mixed",
            chance: 100,
            text: `${name("Cook")} made thin soup go a long way. Nobody is full, but nobody got hurt.`,
            supplies: { food: 3 },
          },
        ],
      },
    ],
  }),

  (name) => ({
    title: "Seeds in the Basement",
    story: `${name("Farmer")} found a sack of seed potatoes and a few grow lights in the basement storage. The rooftop gets sun most of the day.`,
    choices: [
      {
        title: "Everyone plants",
        description: `${name("Farmer")} shows everyone how. A full day of hard work for the whole shelter.`,
        lead: "Farmer",
        outcomes: [
          {
            kind: "success",
            chance: 55,
            text: `${name("Farmer")} also found a bin of dried beans down there. The planting went well, and the shelter eats better tonight.`,
            supplies: { food: 18 },
          },
          {
            kind: "mixed",
            chance: 35,
            text: "The planting is done, and some of the potatoes were fine to eat now. Everyone is worn out.",
            supplies: { food: 11 },
            survivors: [{ role: EVERYONE, health: -5 }],
          },
          {
            kind: "failure",
            chance: 10,
            text: "Most of the seed potatoes were rotten. A long day for very little.",
            supplies: { food: 3 },
            survivors: [{ role: "Farmer", status: "Exhausted" }],
          },
        ],
      },
      {
        title: "Eat them now",
        description: "Forget the garden. Boil the potatoes and eat tonight.",
        outcomes: [
          {
            kind: "success",
            chance: 50,
            text: "There were more in the sack than it looked. A real meal for once.",
            supplies: { food: 14 },
            survivors: [{ role: EVERYONE, health: 5 }],
          },
          {
            kind: "mixed",
            chance: 50,
            text: "A thin meal, but a hot one.",
            supplies: { food: 8 },
          },
        ],
      },
    ],
  }),

  (name) => ({
    title: "The Overturned Ambulance",
    story:
      "An ambulance lies on its side at the end of the block, back doors jammed shut. It was never opened. A few of the dead are still shuffling around it.",
    choices: [
      {
        title: "The medic goes",
        description: `${name("Medic")} knows exactly what to take and where it’s kept.`,
        lead: "Medic",
        outcomes: [
          {
            kind: "success",
            chance: 50,
            text: `${name("Medic")} pried the doors open and came back with a full trauma bag.`,
            supplies: { medicine: 9 },
          },
          {
            kind: "mixed",
            chance: 35,
            text: `${name("Medic")} got some kits out before the dead noticed, then ran.`,
            supplies: { medicine: 5 },
            survivors: [{ role: "Medic", health: -10 }],
          },
          {
            kind: "failure",
            chance: 15,
            text: `${name("Medic")} cut their hand on the broken glass. It’s already looking infected.`,
            supplies: { medicine: 2 },
            survivors: [{ role: "Medic", health: -20, status: "Sick" }],
          },
        ],
      },
      {
        title: "Draw them off first",
        description: `${name("Guard")} makes noise at the far end of the street while ${name("Mechanic")} cuts the doors open.`,
        lead: "Mechanic",
        cost: { ammo: -6 },
        outcomes: [
          {
            kind: "success",
            chance: 60,
            text: "The plan worked perfectly. The ambulance was emptied in five minutes.",
            supplies: { medicine: 9, water: 6 },
          },
          {
            kind: "mixed",
            chance: 30,
            text: `The doors took longer to cut than ${name("Mechanic")} hoped. They got half of it.`,
            supplies: { medicine: 5 },
          },
          {
            kind: "failure",
            chance: 10,
            text: `The noise brought more of them than it drew away. ${name("Mechanic")} had to drop everything and run.`,
            survivors: [{ role: "Mechanic", health: -20 }],
          },
        ],
      },
      {
        title: "Not today",
        description: "Too many of them around it. Maybe they’ll wander off.",
        outcomes: [
          {
            kind: "mixed",
            chance: 100,
            text: "By evening the crowd around the ambulance had only grown.",
          },
        ],
      },
    ],
  }),

  (name) => ({
    title: "Strangers at the Gate",
    story:
      "Three people with a shopping cart stop outside the gate, hands up. They have water jugs and want to trade for bullets. One of them keeps looking at your windows.",
    choices: [
      {
        title: "Trade with them",
        description: "Hand over some ammo through the gate and hope they keep their word.",
        cost: { ammo: -10 },
        outcomes: [
          {
            kind: "success",
            chance: 60,
            text: "Fair trade. They even threw in some canned peaches and a warning about a horde moving west.",
            supplies: { water: 24, food: 8 },
          },
          {
            kind: "mixed",
            chance: 30,
            text: "Half the jugs were only half full. You got water, just not what you paid for.",
            supplies: { water: 14 },
          },
          {
            kind: "failure",
            chance: 10,
            text: "They grabbed the ammo and ran, cart and all.",
          },
        ],
      },
      {
        title: "Take it by force",
        description: `${name("Ex-Soldier")} thinks they’re bluffing and that they’ll fold if you push.`,
        lead: "Ex-Soldier",
        cost: { ammo: -4 },
        outcomes: [
          {
            kind: "success",
            chance: 40,
            text: `They folded. ${name("Ex-Soldier")} took the cart and the ammo they had on them.`,
            supplies: { water: 24, food: 12, ammo: 15 },
          },
          {
            kind: "mixed",
            chance: 35,
            text: `They dropped the cart and ran, but one of them fired back. ${name("Ex-Soldier")} was hit in the arm.`,
            supplies: { water: 15 },
            survivors: [{ role: "Ex-Soldier", health: -20, status: "Injured" }],
          },
          {
            kind: "failure",
            chance: 25,
            text: `They weren’t bluffing. ${name("Ex-Soldier")} and ${name("Guard")} were both hurt, and the strangers got away with everything.`,
            survivors: [
              { role: "Ex-Soldier", health: -30, status: "Injured" },
              { role: "Guard", health: -15 },
            ],
          },
        ],
      },
      {
        title: "Send them away",
        description: "You don’t know them. Keep the gate shut.",
        outcomes: [
          {
            kind: "mixed",
            chance: 100,
            text: "They shrugged and moved on. The one who was watching your windows looked back twice.",
            survivors: [{ role: "Kid · 12", status: "Scared" }],
          },
        ],
      },
    ],
  }),

  (name) => ({
    title: "A Quiet Morning",
    story:
      "For the first time in days there’s nothing moving in the street. No moaning, no gunshots. Just birds. Nobody knows how long it will last.",
    choices: [
      {
        title: "Everyone rests",
        description: "Let people sleep, wash, and patch themselves up while it’s safe.",
        outcomes: [
          {
            kind: "success",
            chance: 70,
            text: `A whole day of real rest. ${name("Teacher")} even ran a card game in the evening. People are laughing again.`,
            survivors: [{ role: EVERYONE, health: 12 }],
          },
          {
            kind: "mixed",
            chance: 30,
            text: "Nobody could really relax, but the rest still helped.",
            survivors: [{ role: EVERYONE, health: 6 }],
          },
        ],
      },
      {
        title: "Scavenge while it’s quiet",
        description: `${name("Scout")} takes a bag and checks the apartments down the street.`,
        lead: "Scout",
        outcomes: [
          {
            kind: "success",
            chance: 50,
            text: `${name("Scout")} found a stocked pantry in a fourth-floor apartment.`,
            supplies: { food: 15, water: 12 },
          },
          {
            kind: "mixed",
            chance: 35,
            text: "Most of the apartments were picked clean. A few cans and bottles.",
            supplies: { food: 8, water: 6 },
          },
          {
            kind: "failure",
            chance: 15,
            text: `The quiet didn’t last. ${name("Scout")} ran into a group in a stairwell.`,
            survivors: [{ role: "Scout", health: -25, status: "Injured" }],
          },
        ],
      },
    ],
  }),

  (name) => ({
    title: "The Dead Generator",
    story: `The building’s backup generator has been dead since the first week. ${name("Engineer")} thinks it could run the old water filter in the basement, if it can be fixed.`,
    choices: [
      {
        title: "Fix it",
        description: `${name("Engineer")} spends the day elbow-deep in the engine.`,
        lead: "Engineer",
        outcomes: [
          {
            kind: "success",
            chance: 50,
            text: `It coughed, then roared. ${name("Engineer")} got the filter running, and it pulled clean water out of the old tank.`,
            supplies: { water: 23 },
          },
          {
            kind: "mixed",
            chance: 35,
            text: "It ran for an hour before giving out. Enough to filter some water.",
            supplies: { water: 12 },
            survivors: [{ role: "Engineer", status: "Exhausted" }],
          },
          {
            kind: "failure",
            chance: 15,
            text: `A fuel line burst. ${name("Engineer")} got burned shutting it down.`,
            survivors: [{ role: "Engineer", health: -20, status: "Injured" }],
          },
        ],
      },
      {
        title: "Strip it for parts",
        description: `${name("Mechanic")} pulls the useful parts and the fuel and builds something else.`,
        lead: "Mechanic",
        outcomes: [
          {
            kind: "success",
            chance: 55,
            text: `${name("Mechanic")} rigged the parts into a pump on the old well and found a box of shells in the maintenance closet.`,
            supplies: { water: 15, ammo: 12 },
          },
          {
            kind: "mixed",
            chance: 45,
            text: "The parts were mostly rust, but the fuel was worth taking.",
            supplies: { water: 6, ammo: 6 },
          },
        ],
      },
    ],
  }),
];
