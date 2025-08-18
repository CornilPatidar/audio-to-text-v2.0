import React from 'react'
import PropTypes from 'prop-types'

export default function CompatibilityWarning({ compatibilityReport, onDismiss, onRetry }) {
    const { compatible, issues, warnings, recommendations, overallScore } = compatibilityReport

    if (compatible && warnings.length === 0) {
        return null
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreText = (score) => {
        if (score >= 80) return 'Excellent'
        if (score >= 60) return 'Good'
        if (score >= 40) return 'Limited'
        return 'Poor'
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Device Compatibility Check
                        </h2>
                        <div className={`text-lg font-semibold ${getScoreColor(overallScore)}`}>
                            {getScoreText(overallScore)} ({overallScore}/100)
                        </div>
                    </div>

                    {/* Critical Issues */}
                    {issues.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Critical Issues
                            </h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <ul className="space-y-2">
                                    {issues.map((issue, index) => (
                                        <li key={index} className="text-red-700 flex items-start">
                                            <span className="text-red-500 mr-2">•</span>
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Warnings */}
                    {warnings.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-yellow-600 mb-3 flex items-center">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                Warnings
                            </h3>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <ul className="space-y-2">
                                    {warnings.map((warning, index) => (
                                        <li key={index} className="text-yellow-700 flex items-start">
                                            <span className="text-yellow-500 mr-2">•</span>
                                            {warning}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
                                <i className="fas fa-lightbulb mr-2"></i>
                                Recommendations
                            </h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <ul className="space-y-2">
                                    {recommendations.map((rec, index) => (
                                        <li key={index} className="text-blue-700 flex items-start">
                                            <span className="text-blue-500 mr-2">•</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Browser specific help */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                            <i className="fas fa-info-circle mr-2"></i>
                            Browser Support
                        </h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-700 mb-2">
                                <strong>Recommended browsers:</strong>
                            </p>
                            <ul className="text-gray-600 space-y-1">
                                <li>• <strong>Chrome 88+</strong> - Best compatibility</li>
                                <li>• <strong>Firefox 95+</strong> - Good compatibility</li>
                                <li>• <strong>Edge 88+</strong> - Good compatibility</li>
                                <li>• <strong>Safari 15+</strong> - Limited compatibility (iOS/Mac)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {compatible ? (
                            <button
                                onClick={onDismiss}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Continue with Warnings
                            </button>
                        ) : (
                            <div className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center">
                                Device Not Compatible
                            </div>
                        )}
                        
                        <button
                            onClick={onRetry}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry Check
                        </button>
                        
                        {compatible && (
                            <button
                                onClick={onDismiss}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Skip Check
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

CompatibilityWarning.propTypes = {
    compatibilityReport: PropTypes.shape({
        compatible: PropTypes.bool.isRequired,
        issues: PropTypes.arrayOf(PropTypes.string).isRequired,
        warnings: PropTypes.arrayOf(PropTypes.string).isRequired,
        recommendations: PropTypes.arrayOf(PropTypes.string).isRequired,
        overallScore: PropTypes.number.isRequired
    }).isRequired,
    onDismiss: PropTypes.func.isRequired,
    onRetry: PropTypes.func.isRequired
}
