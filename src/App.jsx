
import React, { useState } from "react";
import { Sankey, ResponsiveContainer } from "recharts";

const materials = [
  {
    id: "M-10001",
    description: "Steel Rod",
    plant: "P001",
    profitCenter: "PC1000",
    valuationClass: "7920",
    materialGroup: "MG01",
    revenue: true,
  },
  {
    id: "M-20002",
    description: "Plastic Cap",
    plant: "P002",
    profitCenter: "PC2000",
    valuationClass: "7940",
    materialGroup: "MG02",
    revenue: false,
  },
  {
    id: "M-30003",
    description: "Aluminum Pipe",
    plant: "P003",
    profitCenter: "PC3000",
    valuationClass: "7960",
    materialGroup: "MG03",
    revenue: true,
  },
];

const glMapping = {
  "7920": { inventory: "300001", cogs: "500001" },
  "7940": { inventory: "300002", cogs: "500002" },
  "7960": { inventory: "300003", cogs: "500003" },
};

const revenueMapping = {
  MG01: "400010",
  MG02: null,
  MG03: "400030",
};

const generateSankeyData = (material) => {
  const nodes = [
    { name: material.id },
    { name: material.profitCenter },
    { name: `Inventory: ${glMapping[material.valuationClass].inventory}` },
    { name: `COGS: ${glMapping[material.valuationClass].cogs}` },
  ];

  if (material.revenue) {
    nodes.push({ name: `Revenue: ${revenueMapping[material.materialGroup]}` });
  }

  const links = [
    { source: 0, target: 1, value: 10 },
    { source: 1, target: 2, value: 6 },
    { source: 1, target: 3, value: 4 },
  ];

  if (material.revenue) {
    links.push({ source: 1, target: 4, value: 8 });
  }

  return { nodes, links };
};

export default function App() {
  const [selected, setSelected] = useState(materials[0]);
  const [simulatedProfitCenter, setSimulatedProfitCenter] = useState("");
  const [simulatedValClass, setSimulatedValClass] = useState("");

  const materialToUse = {
    ...selected,
    profitCenter: simulatedProfitCenter || selected.profitCenter,
    valuationClass: simulatedValClass || selected.valuationClass,
  };

  const sankeyData = generateSankeyData(materialToUse);

  return (
    <div className="p-4 space-y-4 font-sans">
      <h1 className="text-2xl font-bold text-center">SAP Material Impact Visualizer</h1>

      <div className="space-y-2">
        <label className="block font-medium">Select Material:</label>
        <select
          className="border p-2 w-full max-w-md"
          value={selected.id}
          onChange={(e) =>
            setSelected(materials.find((m) => m.id === e.target.value))
          }
        >
          {materials.map((mat) => (
            <option key={mat.id} value={mat.id}>
              {mat.id} - {mat.description}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1 bg-gray-100 p-4 rounded-lg max-w-xl">
        <h2 className="text-lg font-semibold">Material Snapshot</h2>
        <p><strong>Plant:</strong> {selected.plant}</p>
        <p><strong>Profit Center:</strong> {selected.profitCenter}</p>
        <p><strong>Valuation Class:</strong> {selected.valuationClass}</p>
        <p><strong>Material Group:</strong> {selected.materialGroup}</p>
        <p><strong>Revenue Generating:</strong> {selected.revenue ? "✅ Yes" : "❌ No"}</p>
      </div>

      <div className="space-y-1 bg-yellow-50 p-4 rounded-lg max-w-xl">
        <h2 className="text-lg font-semibold">What-if Simulator</h2>
        <label className="block">Change Profit Center:</label>
        <input
          type="text"
          placeholder="e.g., PC9999"
          className="border p-2 w-full mb-2"
          value={simulatedProfitCenter}
          onChange={(e) => setSimulatedProfitCenter(e.target.value)}
        />
        <label className="block">Change Valuation Class:</label>
        <input
          type="text"
          placeholder="e.g., 7960"
          className="border p-2 w-full"
          value={simulatedValClass}
          onChange={(e) => setSimulatedValClass(e.target.value)}
        />
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">GL Account Flow</h2>
        <ResponsiveContainer width="100%" height={300}>
          <Sankey
            data={sankeyData}
            nodePadding={30}
            margin={{ top: 0, bottom: 0 }}
            link={{ stroke: "#888" }}
            node={{ stroke: "#000", strokeWidth: 1 }}
          />
        </ResponsiveContainer>
      </div>
    </div>
  );
}
