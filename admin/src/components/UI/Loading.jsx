const Loading = ({
    message = "Loading...",
    size = "md", // sm, md, lg
    className = ""
}) => {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    }

    const containerClasses = {
        sm: "py-4",
        md: "py-8",
        lg: "py-12"
    }

    return (
        <div className={`flex items-center justify-center ${containerClasses[size]} ${className}`}>
            <div className="text-center">
                <div className={`animate-spin rounded-full border-b-2 border-yellow-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    )
}

export default Loading
