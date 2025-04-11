import React, { useState } from 'react'

const FilterButtons = () => {
  const [activeFilters, setActiveFilters] = useState([])

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'chocolate-chip', label: 'Chocolate Chip' },
    { id: 'sugar-cookie', label: 'Sugar Cookie' },
    { id: 'specialty', label: 'Specialty' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten-free', label: 'Gluten-Free' }
  ]

  const toggleFilter = (filterId) => {
    if (filterId === 'all') {
      setActiveFilters([])
      return
    }
    
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter(id => id !== filterId))
    } else {
      setActiveFilters([...activeFilters, filterId])
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map(filter => (
        <button
          key={filter.id}
          className={`filter-button ${filter.id === 'all' && activeFilters.length === 0 || activeFilters.includes(filter.id) ? 'active' : ''}`}
          onClick={() => toggleFilter(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default FilterButtons
