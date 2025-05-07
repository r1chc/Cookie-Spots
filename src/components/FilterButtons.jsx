import React from 'react';

const FilterButtons = ({ items, selectedId, onSelect, colorClass /* Optional: if you want to keep colorClass */ }) => {
  // Create a list for rendering, prepending an "All" option
  const displayItems = [
    { _id: null, name: 'All' }, // Using null as the ID for "All"
    ...(items || []), // Spread the received items, ensuring it's an array
  ];

  const handleFilterClick = (itemId) => {
    onSelect(itemId);
    // The parent (SearchResultsPage) handles the toggle logic (if itemId is same as selectedId, it becomes null)
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {displayItems.map(item => (
        <button
          key={item._id || 'all'} // Use item._id or a fallback for the "All" key
          className={`filter-button ${
            selectedId === item._id ? 'active' : ''
          } ${selectedId === item._id && colorClass ? colorClass.replace('bg-', 'bg-opacity-100 font-semibold border-2 border-current ') : colorClass ? colorClass + ' bg-opacity-60' : ''}`}
          // Example of enhancing active state with colorClass, adjust as needed
          onClick={() => handleFilterClick(item._id)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
