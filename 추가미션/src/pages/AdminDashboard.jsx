import React, { useState } from 'react';
import { analyzePlaceUrl } from '../services/MissionService';
import { Link, Search, Sparkles, MapPin, ChevronRight, Loader2 } from 'lucide-react';

const AdminDashboard = ({ onMissionCreated }) => {
    const [storeName, setStoreName] = useState('');
    const [address, setAddress] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        if (!storeName) return;
        setIsAnalyzing(true);
        try {
            // 매장명과 주소를 객체로 전달하여 엄격하게 분석합니다.
            const data = await analyzePlaceUrl({ storeName, address });
            setResult(data);
        } catch (error) {
            console.error("Analysis Error:", error);
            alert(`분석 중 오류가 발생했습니다: ${error.message || error}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="animate-slide-up" style={{ padding: '20px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>추가미션 만들기</h1>
                <p style={{ color: 'var(--toss-grey-600)' }}>매장 정보만 넣으면 AI 마케팅 전문가가 최적의 미션을 설계합니다.</p>
            </header>

            <section className="toss-card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>매장명</label>
                        <input
                            type="text"
                            className="toss-input"
                            placeholder="예: 팻어케이크 잠실본점"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>매장 위치 (선택)</label>
                        <input
                            type="text"
                            className="toss-input"
                            placeholder="예: 05551 (우편번호) 또는 송파동 (주소)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        <p style={{ fontSize: '12px', color: 'var(--toss-grey-500)', marginTop: '6px' }}>
                            우편번호나 도로명 주소를 넣으면 AI가 '정확한 위치'를 단번에 찾습니다.
                        </p>
                    </div>
                    <button
                        className="toss-button toss-button-primary"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !storeName}
                        style={{ marginTop: '8px' }}
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="animate-spin" size={20} /> 전문가 분석 중...</>
                        ) : (
                            '미션 설계 시작하기'
                        )}
                    </button>
                </div>
            </section>

            {result && (
                <div className="animate-slide-up">
                    <section className="toss-card" style={{ border: '2px solid var(--toss-blue-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ padding: '8px', background: 'var(--toss-blue-light)', borderRadius: '12px' }}>
                                <Sparkles color="var(--toss-blue)" size={20} />
                            </div>
                            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>AI 분석 결과</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <p style={{ fontSize: '13px', color: 'var(--toss-grey-500)', marginBottom: '4px' }}>AI가 확인한 매장 주소</p>
                                <p style={{ fontWeight: '600', color: 'var(--toss-blue)' }}>{result.actual_address}</p>
                            </div>

                            <div style={{ padding: '20px', background: 'var(--toss-blue-light)', borderRadius: '20px', border: '1px solid var(--toss-blue)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <p style={{ fontSize: '14px', color: 'var(--toss-blue)', fontWeight: '700' }}>단 하나의 황금 검색어 🏆</p>
                                    <a
                                        href={`https://search.naver.com/search.naver?query=${encodeURIComponent(result.selectedKeyword)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: '12px', color: 'var(--toss-blue)', textDecoration: 'underline', fontWeight: '600' }}
                                    >
                                        실제 검색 결과 확인하기
                                    </a>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--toss-blue)', marginBottom: '12px' }}>
                                    "{result.selectedKeyword}"
                                </h3>
                                <p style={{ fontSize: '13px', color: 'var(--toss-grey-700)', lineHeight: '1.5' }}>
                                    💡 <strong>마케팅 전문가 분석:</strong> {result.reasoning}
                                </p>
                            </div>

                            <div>
                                <p style={{ fontSize: '13px', color: 'var(--toss-grey-500)', marginBottom: '4px' }}>매장 페르소나</p>
                                <p style={{ fontWeight: '600' }}>{result.store_analysis.summary}</p>
                            </div>

                            <div style={{ padding: '16px', background: 'var(--toss-grey-50)', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                    <MapPin size={16} color="var(--toss-blue)" />
                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>설계된 미션 동선</span>
                                </div>
                                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                    출발지: <span style={{ fontWeight: '700' }}>{result.user_mission.start_point}</span><br />
                                    질문: {result.user_mission.quiz_question}
                                </p>
                            </div>
                        </div>

                        <button
                            className="toss-button toss-button-secondary"
                            style={{ marginTop: '24px' }}
                            onClick={() => onMissionCreated(result)}
                        >
                            이 미션으로 확정하기 <ChevronRight size={18} />
                        </button>
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
