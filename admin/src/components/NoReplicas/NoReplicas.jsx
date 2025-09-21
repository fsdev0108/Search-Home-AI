import React from 'react'
import { Button, Card } from '../UI'

const NoReplicas = ({ onNavigateToReplicas }) => {
    return (
        <div className="container-admin py-8">
            <div className="flex justify-center items-center min-h-[400px]">
                <Card className="text-center max-w-md mx-auto">
                    <div className="py-8">
                        <div className="text-6xl mb-6 opacity-70">🤖</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            No Replicas Created
                        </h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            You need to create at least one AI replica before using this feature.
                            Replicas are your AI assistants that can help customers with property inquiries.
                        </p>
                        <Button
                            onClick={onNavigateToReplicas}
                            className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold px-8 py-3"
                        >
                            Create Your First Replica
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default NoReplicas
