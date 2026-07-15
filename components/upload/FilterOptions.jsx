"use client";

import { useState } from "react";

export default function FilterOptions() {
  const [filters, setFilters] = useState({
    problem: true,
    choices: true,
    additional: false,
    graph: true,
  });

  function handleToggle(key) {
    setFilters({ ...filters, [key]: !filters[key] });
  }

  return (
    <div className="filter-options">
      <h3>표시 항목</h3>
      <div className="filter-group">
        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.problem}
            onChange={() => handleToggle("problem")}
          />
          <span>문제</span>
        </label>
        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.choices}
            onChange={() => handleToggle("choices")}
          />
          <span>선택지</span>
        </label>
        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.additional}
            onChange={() => handleToggle("additional")}
          />
          <span>추가</span>
        </label>
        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.graph}
            onChange={() => handleToggle("graph")}
          />
          <span>도형/그래프</span>
        </label>
      </div>
    </div>
  );
}
