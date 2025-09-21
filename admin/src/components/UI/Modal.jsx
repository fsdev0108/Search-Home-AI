import React, { useEffect } from 'react'
import { Button } from './index'

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    showConfirm = true,
    showCancel = true,
    confirmVariant = 'primary',
    cancelVariant = 'outline',
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true
}) => {
    // Handle escape key
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, closeOnEscape, onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    }

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose()
        }
    }

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm()
        } else {
            onClose()
        }
    }

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        } else {
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleOverlayClick}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-sm bg-white shadow-xl transition-all`}>
                    {/* Header */}
                    {title && (
                        <div className="border-b border-gray-200 px-6 py-4 bg-black">
                            <h3 className="text-lg font-semibold text-yellow-600">
                                {title}
                            </h3>
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-6 py-4">
                        {children}
                    </div>

                    {/* Footer */}
                    {(showConfirm || showCancel) && (
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <div className="flex justify-end space-x-3">
                                {showCancel && (
                                    <Button
                                        variant={cancelVariant}
                                        onClick={handleCancel}
                                    >
                                        {cancelText}
                                    </Button>
                                )}
                                {showConfirm && (
                                    <Button
                                        variant={confirmVariant}
                                        onClick={handleConfirm}
                                    >
                                        {confirmText}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Modal
