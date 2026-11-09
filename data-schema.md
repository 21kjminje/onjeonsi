# 온전시 데이터 규격 (Data Schema)

## 1. exhibitions.json (전시 정보)
- `id`: 전시 고유 ID
- `venueId`: 시설 고유 ID (`venues.json`과 매칭)
- `avgStayTime`: 권장 관람 소요 시간 (minutes)
- `isHolidayClosed`: 공휴일 자동 휴관 여부 (boolean)
- ... 기타 기존 필드

## 2. venues.json (시설 운영 정보)
- `venueId`: 시설 고유 ID
- `operatingHours`: 요일별 운영 객체 `{ "mon": { "open": "HH:mm", "close": "HH:mm", "lastEntry": "HH:mm" }, ... }`
- `regularHolidays`: 정기 휴관 요일 배열 `["monday", "tuesday"]`