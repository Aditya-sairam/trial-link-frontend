import { useState } from "react";

/**
 * Reusable collapsible dynamic list component.
 * Used by every form step that manages a List[Model] field.
 *
 * Props:
 *  - items        : current array of items (from useFieldArray)
 *  - onAdd        : fn to append a new default item
 *  - onRemove     : fn(index) to remove an item
 *  - label        : section label e.g. "Condition"
 *  - renderForm   : fn(index) => JSX — renders the expanded form for item at index
 *  - renderSummary: fn(item) => string — short summary shown when collapsed
 */
export default function DynamicListField({
  items,
  onAdd,
  onRemove,
  label,
  renderForm,
  renderSummary,
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggle = (i) => setExpandedIndex(expandedIndex === i ? null : i);

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-gray-400 italic">No {label.toLowerCase()}s added yet.</p>
      )}

      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Collapsed header row */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggle(i)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase w-6">
                #{i + 1}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {renderSummary(item) || `New ${label}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
              <span className="text-gray-400 text-sm">
                {expandedIndex === i ? "▲" : "▼"}
              </span>
            </div>
          </div>

          {/* Expanded form */}
          {expandedIndex === i && (
            <div className="px-4 py-4 border-t border-gray-200 bg-white">
              {renderForm(i)}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          onAdd();
          setExpandedIndex(items.length); // auto-expand new item
        }}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors font-medium"
      >
        + Add {label}
      </button>
    </div>
  );
}