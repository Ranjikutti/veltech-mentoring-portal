import React, { useEffect, useRef, useState } from 'react'

function DarkSelect({ options, value, onChange, placeholder = 'Select', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = val => {
    if (onChange) onChange(val)
    setOpen(false)
  }

  const selectedOption = options.find(o => (o.value ?? o) === value)
  const label = selectedOption ? (selectedOption.label ?? selectedOption.value ?? selectedOption) : placeholder

  return (
    <div ref={ref} className={`dark-select ${className}`}>
      <button
        type="button"
        className="dark-select-trigger"
        onClick={() => setOpen(o => !o)}
      >
        <span className="dark-select-label">{label}</span>
        <span className="dark-select-chevron">▾</span>
      </button>

      {open && (
        <div className="dark-select-menu">
          {options.map(opt => {
            const val = opt.value ?? opt
            const text = opt.label ?? opt
            const active = val === value
            return (
              <div
                key={val}
                className={`dark-select-option${active ? ' active' : ''}`}
                onClick={() => handleSelect(val)}
              >
                {text}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DarkSelect
