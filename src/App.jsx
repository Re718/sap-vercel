/* Add this to your index.css or global stylesheet */
.recharts-sankey-node rect[fill="green"] {
  fill: #34d399 !important; /* Tailwind green-400 */
}
.recharts-sankey-node rect[fill="red"] {
  fill: #f87171 !important; /* Tailwind red-400 */
}
.recharts-sankey-node rect[fill="#8884d8"] {
  fill: #3b82f6 !important; /* Tailwind blue-500 */
}
.recharts-sankey-node rect[fill="#82ca9d"] {
  fill: #14b8a6 !important; /* Tailwind teal-400 */
}

// React Component Below
import React, { useState, useEffect } from "react";
import { Sankey, ResponsiveContainer } from "recharts";
import materialData from "./data/material_master_data.json";
import glData from "./data/gl_master_data.json";

const blockedGLs = ["400010"];
const closedPeriods = ["2025-04"];

const buildMappings = (materials, gls) => {
  const valMap = {};
  const revMap = {};
  gls.forEach((gl) => {
    if (gl.Type === "Inventory") valMap[gl.GLAccount] = gl.GLAccount;
    if (gl.Type === "COGS") valMap[gl.GLAccount] = gl.GLAccount;
    if (gl.Type === "Revenue") revMap[gl.GLAccount] = gl.GLAccount;
  });
  return { valMap, revMap };
};

const { valMap, revMap } = buildMappings(materialData, glData);

const generateSankeyData = (material, period) => {
  const inventoryGL = Object.keys(valMap)[Math.floor(Math.random() * 25)];
  const cogsGL = Object.keys(valMap)[Math.floor(Math.random() * 25 + 25)];
  const revenueGL = Object.keys(revMap)[Math.floor(Math.random() * Object.keys(revMap).length)];

  const isGLBlocked = blockedGLs.includes(revenueGL);
  const isPeriodClosed = closedPeriods.includes(period);
  const isRevenue = !!revenueGL && !isGLBlocked && !isPeriodClosed;

  const nodes = [
    { name: material.MaterialID, color: "#ccc" },
    { name: material.ProfitCenter, color: "#ccc" },
    { name: `Inventory: ${inventoryGL}`, color: "#8884d8" },
    { name: `COGS: ${cogsGL}`, color: "#82ca9d" },
  ];

  const links = [
    { source: 0, target: 1, value: 10 },
    { source: 1, target: 2, value: 6 },
    { source: 1, target: 3, value: 4 },
  ];

  if (isRevenue) {
    nodes.push({ name: `Revenue: ${revenueGL}`, color: "green" });
    links.push({ source: 1, target: 4, value: 8 });
  } else {
    nodes.push({ name: `Revenue (Blocked): ${revenueGL}`, color: "red" });
    links.push({ source: 1, target: 4, value: 8 });
  }

  return { nodes, links, isRevenue };
};
