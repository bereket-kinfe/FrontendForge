"use client";
import { useState } from "react";

export default function CategoryPills({ categories = [], active, onSelect }) {
  const [selected, setSelected] = useState(active || categories[0] || "");
  return <div className="category-pills" aria-label="Categories">{categories.map((category) => {
    const current = active ?? selected;
    const isSelected = category === current;
    return <button type="button" key={category} className={isSelected ? "category-pill is-active" : "category-pill"} aria-pressed={isSelected} onClick={() => { setSelected(category); onSelect?.(category); }}>{category}</button>;
  })}</div>;
}
