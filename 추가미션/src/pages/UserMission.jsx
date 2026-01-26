import React, { useState, useEffect } from 'react';
import { Copy, Map, ChevronRight, CheckCircle2, Clock, Landmark } from 'lucide-react';
import confetti from 'canvas-confetti';

const UserMission = ({ missionData, onComplete }) => {
    const [step, setStep] = useState(1);
    const [isCopied, setIsCopied] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(missionData.selectedKeyword);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleVerify = () => {
        if (inputValue.includes(missionData.landmarkData.walkingTime.replace('분', '')) ||
            inputValue.includes(missionData.landmarkData.walkingTime)) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0064FF', '#60A5FA', '#FFFFFF']
            });
            setStep(3);
        } else {
            alert('입력하신 정보가 지도상의 정보와 다릅니다. 다시 확인해주세요!');
        }
    };

    return (
        <div className="animate-slide-up" style={{ padding: '0 0 100px 0' }}>
            {/* Top Banner */}
            <div style={{
                padding: '40px 24px',
                background: 'linear-gradient(180deg, var(--toss-blue-light) 0%, white 100%)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '64px', height: '64px', background: 'white', borderRadius: '20px',
                    margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <Landmark color="var(--toss-blue)" size={32} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
                    길 찾고 {step === 3 ? '보상 받기' : '포인트 받기'}
                </h2>
                <p style={{ color: 'var(--toss-grey-600)', fontSize: '15px' }}>
                    {missionData.name} 매장까지 가는 길을 확인해보세요.
                </p>
            </div>

            <div style={{ padding: '0 20px' }}>
                {step === 1 && (
                    <div className="animate-slide-up">
                        <div className="toss-card">
                            <span style={{
                                fontSize: '12px', fontWeight: '700', color: 'var(--toss-blue)',
                                background: 'var(--toss-blue-light)', padding: '4px 8px', borderRadius: '6px'
                            }}>Step 1</span>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: '12px', marginBottom: '8px' }}>
                                키워드를 복사하세요
                            </h3>
                            <p style={{ color: 'var(--toss-grey-600)', fontSize: '14px', marginBottom: '20px' }}>
                                매장명 없이도 검색 결과 <span style={{ color: 'var(--toss-blue)', fontWeight: '700' }}>1등에 꽂히는</span> 유일한 키워드입니다.
                            </p>

                            <div style={{
                                background: 'var(--toss-grey-50)', padding: '16px', borderRadius: '16px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                border: '1px solid var(--toss-grey-200)', marginBottom: '16px'
                            }}>
                                <span style={{ fontWeight: '600' }}>{missionData.selectedKeyword}</span>
                                <button onClick={handleCopy} style={{
                                    background: 'none', border: 'none', color: isCopied ? '#22C55E' : 'var(--toss-blue)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600'
                                }}>
                                    {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    {isCopied ? '복사됨' : '복사'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--toss-grey-500)', fontSize: '14px' }}>
                                <Map size={16} />
                                <span>출발지: <strong>{missionData.startingPoint}</strong></span>
                            </div>
                        </div>

                        <div className="bottom-cta">
                            <button
                                className="toss-button toss-button-primary"
                                onClick={() => {
                                    window.open(`https://map.naver.com/v5/search/${encodeURIComponent(missionData.selectedKeyword)}`, '_blank');
                                    setStep(2);
                                }}
                            >
                                네이버 지도 열기 <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up">
                        <div className="toss-card">
                            <span style={{
                                fontSize: '12px', fontWeight: '700', color: 'var(--toss-blue)',
                                background: 'var(--toss-blue-light)', padding: '4px 8px', borderRadius: '6px'
                            }}>Step 2</span>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: '12px', marginBottom: '8px' }}>
                                정답을 입력해주세요
                            </h3>
                            <p style={{ color: 'var(--toss-grey-600)', fontSize: '14px', marginBottom: '20px' }}>
                                {missionData.quizQuestion || `지도에서 ${missionData.startingPoint} 로부터 매장까지의 도보 시간을 확인해주세요.`}
                            </p>

                            <input
                                type="text"
                                className="toss-input"
                                placeholder="예: 8분"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                style={{ textAlign: 'center', fontSize: '20px', fontWeight: '700' }}
                            />
                        </div>

                        <div className="bottom-cta">
                            <button
                                className="toss-button toss-button-primary"
                                onClick={handleVerify}
                                disabled={!inputValue}
                            >
                                정답 제출하기
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide-up" style={{ textAlign: 'center', paddingTop: '40px' }}>
                        <div style={{
                            width: '80px', height: '80px', background: 'var(--toss-blue)', borderRadius: '50%',
                            margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(0, 100, 255, 0.2)'
                        }}>
                            <CheckCircle2 color="white" size={40} />
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>미션 완료!</h3>
                        <p style={{ color: 'var(--toss-grey-600)', marginBottom: '32px' }}>
                            성공적으로 길을 찾으셨네요. <br />
                            <strong>100원</strong>이 적립되었습니다.
                        </p>

                        <button
                            className="toss-button toss-button-secondary"
                            onClick={onComplete}
                        >
                            닫기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserMission;
