
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
    { name: material.MaterialID },
    { name: material.ProfitCenter },
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

export default function App() {
  const [selected, setSelected] = useState(null);
  const [simulatedProfitCenter, setSimulatedProfitCenter] = useState("");
  const [simulatedValClass, setSimulatedValClass] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [period, setPeriod] = useState("2025-04");
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("04");
  const [plant, setPlant] = useState("");
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [sankeyData, setSankeyData] = useState({ nodes: [], links: [], isRevenue: false });

  useEffect(() => {
    const combinedPeriod = `${year}-${month}`;
    setPeriod(combinedPeriod);
  }, [year, month]);

  useEffect(() => {
    const filtered = materialData.filter((mat) => !plant || mat.Plant === plant);
    setFilteredMaterials(filtered);
  }, [plant]);

  useEffect(() => {
    if (selected) {
      const materialToUse = {
        ...selected,
        ProfitCenter: simulatedProfitCenter || selected.ProfitCenter,
        ValuationClass: simulatedValClass || selected.ValuationClass,
      };
      setSankeyData(generateSankeyData(materialToUse, period));
    }
  }, [selected, simulatedProfitCenter, simulatedValClass, period]);

  return (
    <div className="p-4 space-y-4 font-sans">
      <h1 className="text-2xl font-bold text-center">SAP Material Impact Visualizer</h1>

      <div className="space-y-2">
        <label className="block font-medium">Filter by Plant:</label>
        <select className="border p-2 w-full max-w-md" onChange={(e) => setPlant(e.target.value)}>
          <option value="">All Plants</option>
          {[...new Set(materialData.map((m) => m.Plant))].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <label className="block font-medium mt-2">Select Year and Month:</label>
        <div className="flex gap-2">
          <select className="border p-2" value={year} onChange={(e) => setYear(e.target.value)}>
            {["2023", "2024", "2025"].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select className="border p-2" value={month} onChange={(e) => setMonth(e.target.value)}>
            {[...Array(12)].map((_, i) => {
              const m = (i + 1).toString().padStart(2, '0');
              return <option key={m} value={m}>{m}</option>;
            })}
          </select>
        </div>

        <label className="block font-medium mt-2">Select Material:</label>
        <select
          className="border p-2 w-full max-w-md"
          onChange={(e) => setSelected(filteredMaterials.find((m) => m.MaterialID === e.target.value))}
        >
          <option>Select...</option>
          {filteredMaterials.map((mat) => (
            <option key={mat.MaterialID} value={mat.MaterialID}>
              {mat.MaterialID} - {mat.Description}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          <div className="space-y-1 bg-gray-100 p-4 rounded-lg max-w-xl">
            <h2 className="text-lg font-semibold">Material Snapshot</h2>
            <p><strong>Plant:</strong> {selected.Plant}</p>
            <p><strong>Profit Center:</strong> {selected.ProfitCenter}</p>
            <p><strong>Valuation Class:</strong> {selected.ValuationClass}</p>
            <p><strong>Material Group:</strong> {selected.MaterialGroup}</p>
            <p><strong>Taxable:</strong> {selected.Taxable ? "Yes" : "No"}</p>
            <p><strong>Price:</strong> ${selected.Price}</p>
            <p><strong>Revenue Determined:</strong> {sankeyData.isRevenue ? "✅ Yes" : "❌ No"}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">GL Account Flow</h2>
            <ResponsiveContainer width="100%" height={300}>
              <Sankey
                data={{ nodes: sankeyData.nodes, links: sankeyData.links }}
                nodePadding={30}
                margin={{ top: 0, bottom: 0 }}
                link={{ stroke: "#888", strokeOpacity: 0.4 }}
                node={{
                  stroke: "#000",
                  strokeWidth: 1,
                  fill: (node) => node.color || "#ccc"
                }}
              />
            </ResponsiveContainer>
            <div className="mt-2 text-sm text-gray-600">
              <strong>Legend:</strong> Green = Revenue GL, Red = Blocked Revenue, Blue = Inventory, Teal = COGS<br />
              Revenue shown only if GL is active and period is open.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
