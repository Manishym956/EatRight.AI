import './ResultsCard.css';
import { MacronutrientChart, MicronutrientChart, MicronutrientList } from './NutrientCharts';
import { BenefitsChecklist, CautionsChecklist } from './HealthInsights';

function ResultsCard({ results, imageUrl, onReset }) {
    const getVerdictColor = (verdict) => {
        const v = verdict.toLowerCase();
        if (v.includes('healthy') || v.includes('good')) return 'healthy';
        if (v.includes('unhealthy') || v.includes('bad')) return 'unhealthy';
        return 'neutral';
    };

    const verdictClass = getVerdictColor(results.health_verdict);

    return (
        <div className="results-container">
            <div className="results-card glass">
                {/* Image Section */}
                <div className="results-image-section">
                    <img src={imageUrl} alt="Analyzed meal" className="results-image" />
                    <div className={`verdict-badge ${verdictClass}`}>
                        {verdictClass === 'healthy' && '✓'}
                        {verdictClass === 'unhealthy' && '✗'}
                        {verdictClass === 'neutral' && '~'}
                        <span>{results.health_verdict}</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="results-content">
                    {/* Food Items */}
                    <div className="results-section food-items-section">
                        <h3 className="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
                                <path d="M7 2v20" />
                                <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                            </svg>
                            Identified Foods
                        </h3>
                        <div className="food-items-list">
                            {results.food_items.map((item, index) => (
                                <div
                                    key={index}
                                    className="food-item"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <span className="food-item-icon">🍽️</span>
                                    <span className="food-item-name">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nutrition Facts */}
                    <div className="results-section nutrition-section">
                        <h3 className="section-title">
                            <span className="icon">📊</span>
                            Nutrition Facts
                        </h3>
                        <div className="nutrition-grid">
                            <div className="nutrition-item calories">
                                <span className="value">{results.calories || 0}</span>
                                <span className="label">Calories</span>
                            </div>
                            <div className="nutrition-item">
                                <span className="value">{results.protein || 0}g</span>
                                <span className="label">Protein</span>
                            </div>
                            <div className="nutrition-item">
                                <span className="value">{results.carbs || 0}g</span>
                                <span className="label">Carbs</span>
                            </div>
                            <div className="nutrition-item">
                                <span className="value">{results.fats || 0}g</span>
                                <span className="label">Fats</span>
                            </div>
                        </div>
                    </div>

                    {/* Macronutrient Distribution */}
                    <div className="results-section chart-section">
                        <h3 className="section-title">
                            <span className="icon">🥧</span>
                            Macronutrient Distribution
                        </h3>
                        <MacronutrientChart
                            protein={results.protein}
                            carbs={results.carbs}
                            fats={results.fats}
                        />
                    </div>

                    {/* Benefits and Cautions Side by Side */}
                    {(results.benefits?.length > 0 || results.cautions?.length > 0) && (
                        <div className="insights-grid">
                            {results.benefits?.length > 0 && (
                                <BenefitsChecklist benefits={results.benefits} />
                            )}
                            {results.cautions?.length > 0 && (
                                <CautionsChecklist cautions={results.cautions} />
                            )}
                        </div>
                    )}

                    {/* Micronutrient Distribution */}
                    {results.micronutrients && Object.keys(results.micronutrients).length > 0 && (
                        <>
                            <div className="results-section chart-section">
                                <h3 className="section-title">
                                    <span className="icon">💊</span>
                                    Micronutrient Distribution
                                </h3>
                                <MicronutrientChart micronutrients={results.micronutrients} />
                            </div>

                            <div className="results-section micronutrients-section">
                                <h3 className="section-title">
                                    <span className="icon">🌟</span>
                                    Micronutrients Details
                                </h3>
                                <MicronutrientList micronutrients={results.micronutrients} />
                            </div>
                        </>
                    )}

                    {/* Nutrition Advice */}
                    <div className="results-section advice-section">
                        <h3 className="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            Nutritionist Advice
                        </h3>
                        <p className="advice-text">{results.nutrition_advice}</p>
                    </div>

                    {/* Action Button */}
                    <button className="reset-button btn-primary" onClick={onReset}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" />
                            <path d="M3 21v-5h5" />
                        </svg>
                        Analyze Another Meal
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResultsCard;
