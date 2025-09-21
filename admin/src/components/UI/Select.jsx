import React from 'react'

const Select = ({
    label,
    error,
    options = [],
    placeholder = 'Select an option',
    className = '',
    ...props
}) => {
    const selectClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-sm
    focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500' : ''}
    ${className}
  `.trim()

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <select
                className={selectClasses}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}

export default Select
