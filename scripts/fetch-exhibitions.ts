import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 로컬 .env 파일 환경 변수 로드
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
}

const API_KEY = process.env.SEOUL_DATA_API_KEY;
if (!API_KEY) {
  console.error('❌ SEOUL_DATA_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

interface RawSeoulEvent {
  CODENAME: string;
  TITLE: string;
  DATE: string;
  PLACE: string;
  GUNAME: string;
  STRTDATE: string;
  END_DATE: string;
  ORG_LINK: string;
  LAT: string; // Latitude (위도)
  LOT: string; // Longitude (경도)
}

async function fetchExhibitions() {
  console.log('📡 서울시 문화행사 API 호출 중...');
  // startIndex부터 endIndex까지 조회
  const startIndex = 1;
  const endIndex = 1000;
  const url = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/culturalEventInfo/${startIndex}/${endIndex}/`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.culturalEventInfo || !data.culturalEventInfo.row) {
      console.error('❌ 데이터를 불러오지 못했습니다:', data);
      return;
    }

    const rows: RawSeoulEvent[] = data.culturalEventInfo.row;
    console.log(`📦 전체 가져온 행사 건수: ${rows.length}건`);

    // 종로구 / 중구 및 전시/미술 관련 행사 필터링
    const filtered = rows.filter(item => {
      const gu = (item.GUNAME || '').trim();
      const code = (item.CODENAME || '').trim();
      const place = (item.PLACE || '').trim();

      const isTargetGu = gu.includes('종로구') || gu.includes('중구');
      const isTargetGenre =
        code.includes('전시') ||
        code.includes('미술') ||
        place.includes('미술관') ||
        place.includes('박물관') ||
        place.includes('갤러리') ||
        place.includes('DDP');

      return isTargetGu && isTargetGenre;
    });

    console.log(`🎯 종로구·중구 전시 필터링 결과: ${filtered.length}건`);

    // 온전시 Exhibition 규격에 맞게 변환
    const exhibitions = filtered.map((item, idx) => {
      const start = item.STRTDATE ? item.STRTDATE.split(' ')[0] : '';
      const end = item.END_DATE ? item.END_DATE.split(' ')[0] : '';

      return {
        id: `auto-seoul-${idx + 1}`,
        venueId: '',
        title: item.TITLE.trim(),
        start,
        end,
        field: item.CODENAME || '전시/미술',
        placeName: item.PLACE.trim(),
        link: item.ORG_LINK || '',
        lat: Number(item.LAT),
        lng: Number(item.LOT),
        fetchedAt: new Date().toISOString()
      };
    });

    const outputDir = path.resolve(__dirname, '../data/exhibitions');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'auto.json');
    fs.writeFileSync(outputPath, JSON.stringify(exhibitions, null, 2), 'utf-8');
    console.log(`✅ ${outputPath} 저장 완료 (${exhibitions.length}건)`);
  } catch (error) {
    console.error('❌ 스크립트 실행 중 에러 발생:', error);
  }
}

fetchExhibitions();
