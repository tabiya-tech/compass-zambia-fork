import { SkillsDemandSupplyData, SkillsGapSectorData } from "src/types";

export const mockSkillsDemandSupply: SkillsDemandSupplyData[] = [
  { skillName: "Electrical Installation", supplyPct: 42, demandPct: 55 },
  { skillName: "Circuit Analysis", supplyPct: 38, demandPct: 40 },
  { skillName: "Computer Literacy", supplyPct: 35, demandPct: 38 },
  { skillName: "Technical Drawing", supplyPct: 32, demandPct: 0 },
  { skillName: "Problem Solving", supplyPct: 30, demandPct: 0 },
  { skillName: "Safety Procedures", supplyPct: 28, demandPct: 48 },
  { skillName: "Customer Service", supplyPct: 26, demandPct: 28 },
  { skillName: "Project Planning", supplyPct: 22, demandPct: 35 },
  { skillName: "Welding & Fabrication", supplyPct: 20, demandPct: 45 },
  { skillName: "Financial Literacy", supplyPct: 18, demandPct: 0 },
  { skillName: "PLC Programming", supplyPct: 0, demandPct: 40 },
  { skillName: "Renewable Energy Systems", supplyPct: 0, demandPct: 32 },
  { skillName: "Quality Control", supplyPct: 0, demandPct: 25 },
  { skillName: "Data Analysis", supplyPct: 0, demandPct: 22 },
];

export const mockSkillsGapSector: SkillsGapSectorData[] = [
  { sector: "Agriculture", supplyPct: 34, demandPct: 40 },
  { sector: "Construction", supplyPct: 40, demandPct: 48 },
  { sector: "Energy", supplyPct: 41, demandPct: 55 },
  { sector: "Hospitality", supplyPct: 39, demandPct: 49 },
  { sector: "ICT", supplyPct: 35, demandPct: 52 },
  { sector: "Manufacturing", supplyPct: 35, demandPct: 47 },
  { sector: "Mining", supplyPct: 38, demandPct: 49 },
  { sector: "Transport", supplyPct: 31, demandPct: 42 },
  { sector: "Water", supplyPct: 34, demandPct: 48 },
];
