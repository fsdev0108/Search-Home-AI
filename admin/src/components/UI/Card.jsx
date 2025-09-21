import React from 'react'

const Card = ({
    children,
    className = '',
    padding = 'md',
    ...props
}) => {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    }

    const classes = `
    bg-white border border-gray-200 shadow-sm
    ${paddingClasses[padding]}
    ${className}
  `.trim()

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    )
}

export default Card
