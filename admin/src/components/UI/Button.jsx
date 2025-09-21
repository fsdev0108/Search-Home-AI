import React from 'react'

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const baseClasses = 'font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    }

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
