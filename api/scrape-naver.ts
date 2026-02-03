import type { VercelRequest, VercelResponse } from '@vercel/node';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { placeUrl } = req.body as { placeUrl: string };

    if (!placeUrl) {
        return res.status(400).json({ error: 'placeUrl is required' });
    }

    let browser;
    try {
        console.log('🔍 네이버 플레이스 크롤링 시작:', placeUrl);

        // Puppeteer 브라우저 실행
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        
        // User-Agent 설정 (봇 차단 우회)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        // 페이지 로드
        await page.goto(placeUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // 네이버 플레이스 정보 추출
        const placeData = await page.evaluate(() => {
            const data: any = {
                name: '',
                address: '',
                category: '',
                rating: '',
                reviewCount: '',
                menus: [] as string[],
                reviews: [] as string[],
                keywords: [] as string[],
                openHours: '',
            };

            // 매장명
            const nameEl = document.querySelector('.GHAhO');
            if (nameEl) data.name = nameEl.textContent?.trim() || '';

            // 주소
            const addressEl = document.querySelector('.LDgIH');
            if (addressEl) data.address = addressEl.textContent?.trim() || '';

            // 카테고리
            const categoryEl = document.querySelector('.DJJvD');
            if (categoryEl) data.category = categoryEl.textContent?.trim() || '';

            // 평점
            const ratingEl = document.querySelector('.PXMot');
            if (ratingEl) data.rating = ratingEl.textContent?.trim() || '';

            // 리뷰 수
            const reviewCountEl = document.querySelector('.place_section_count');
            if (reviewCountEl) data.reviewCount = reviewCountEl.textContent?.trim() || '';

            // 메뉴 (최대 10개)
            const menuEls = document.querySelectorAll('.E_UVRX');
            menuEls.forEach((el, i) => {
                if (i < 10) {
                    data.menus.push(el.textContent?.trim() || '');
                }
            });

            // 리뷰 (최대 10개, 텍스트만)
            const reviewEls = document.querySelectorAll('.zPfVt');
            reviewEls.forEach((el, i) => {
                if (i < 10) {
                    const text = el.textContent?.trim() || '';
                    if (text.length > 10) { // 의미있는 리뷰만
                        data.reviews.push(text);
                    }
                }
            });

            // 키워드 태그
            const keywordEls = document.querySelectorAll('.place_theme_tag');
            keywordEls.forEach(el => {
                data.keywords.push(el.textContent?.trim() || '');
            });

            // 영업시간
            const hoursEl = document.querySelector('.O8qbU');
            if (hoursEl) data.openHours = hoursEl.textContent?.trim() || '';

            return data;
        });

        console.log('✅ 크롤링 완료:', placeData);

        // AI 분석용 텍스트 생성
        const analysisText = `
[네이버 플레이스 실제 데이터]
매장명: ${placeData.name}
주소: ${placeData.address}
카테고리: ${placeData.category}
평점: ${placeData.rating} (리뷰 ${placeData.reviewCount}개)

대표 메뉴:
${placeData.menus.slice(0, 5).join(', ')}

고객 리뷰 (실제 반응):
${placeData.reviews.slice(0, 5).map((r: string, i: number) => `${i + 1}. ${r.substring(0, 100)}...`).join('\n')}

자주 언급되는 키워드:
${placeData.keywords.join(', ')}

영업시간: ${placeData.openHours}
        `;

        return res.status(200).json({
            success: true,
            data: placeData,
            analysisText: analysisText.trim()
        });

    } catch (error) {
        console.error('❌ 크롤링 실패:', error);
        return res.status(500).json({
            error: 'Scraping failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
