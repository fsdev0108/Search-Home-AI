import React from 'react'
import './NoReplicas.css'

const NoReplicas = ({ onNavigateToReplicas }) => {
    return (
        <div className="no-replicas-container">
            <div className="no-replicas-content">
                <div className="no-replicas-icon">🤖</div>
                <h2>No replicas created</h2>
                <p>You need to create at least one replica before using this feature.</p>
                <button
                    className="no-replicas-btn"
                    onClick={onNavigateToReplicas}
                >
                    Click here to create
                </button>
            </div>
        </div>
    )
}

export default NoReplicas
