import { Venue, Exhibition, JudgeResult } from '../types';

export interface MockItem {
  venue: Venue;
  exhibition: Exhibition;
  judgeResult: JudgeResult;
}

export const mockItems: MockItem[] = [
  {
    venue: {
      id: 'jongno-001',
      name: '국립현대미술관 서울',
      aliases: ['MMCA 서울', '국립현대미술관 서울관'],
      gu: '종로구',
      type: '미술관',
      lat: 37.5786,
      lng: 126.9802,
      representative: true,
      hours: {
        mon: { open: '10:00', close: '18:00' },
        tue: { open: '10:00', close: '18:00' },
        wed: { open: '10:00', close: '21:00' },
        thu: { open: '10:00', close: '18:00' },
        fri: { open: '10:00', close: '18:00' },
        sat: { open: '10:00', close: '21:00' },
        sun: { open: '10:00', close: '18:00' }
      },
      lastEntry: '20:00',
      visitMinutes: 90,
      docent: [{ days: ['wed', 'sat'], times: ['14:00', '16:00'] }],
      entry: '현장 발권 / 온라인 예약',
      reservation: '선택 (주말 권장)',
      source: 'https://www.mmca.go.kr',
      verified: '2026-10-30'
    },
    exhibition: {
      id: 'ex-001',
      venueId: 'jongno-001',
      title: '올해의 작가상 2026',
      start: '2026-09-01',
      end: '2026-11-30',
      field: '미술/현대미술',
      link: 'https://www.mmca.go.kr'
    },
    judgeResult: {
      result: 'possible',
      reasons: ['입장 마감(20:00) 전 도착', '폐관 전 관람 시간 90분 확보 가능'],
      entryTime: '15:20',
      endTime: '16:50',
      slackMinutes: 70
    }
  },
  {
    venue: {
      id: 'jongno-002',
      name: '아르코미술관',
      aliases: ['대학로 아르코'],
      gu: '종로구',
      type: '미술관',
      lat: 37.5817,
      lng: 127.0028,
      representative: true,
      hours: {
        tue: { open: '11:00', close: '19:00' },
        wed: { open: '11:00', close: '19:00' },
        thu: { open: '11:00', close: '19:00' },
        fri: { open: '11:00', close: '19:00' },
        sat: { open: '11:00', close: '19:00' },
        sun: { open: '11:00', close: '19:00' }
      },
      closed: { weekday: 'mon' },
      lastEntry: '15:10',
      visitMinutes: 60,
      entry: '현장 입장',
      reservation: '필요 없음',
      source: 'https://www.arko.or.kr',
      verified: '2026-10-30'
    },
    exhibition: {
      id: 'ex-002',
      venueId: 'jongno-002',
      title: '기억의 지층전',
      start: '2026-10-01',
      end: '2026-11-15',
      field: '설치미술',
      link: 'https://www.arko.or.kr'
    },
    judgeResult: {
      result: 'impossible',
      reasons: ['입장 마감(15:10) 이후 도착 예정 (도착 예정 시각: 15:20)']
    }
  },
  {
    venue: {
      id: 'junggu-003',
      name: '중구 시민 갤러리',
      aliases: ['을지로 전시관'],
      gu: '중구',
      type: '미술관',
      lat: 37.5663,
      lng: 126.9979,
      representative: false,
      source: 'https://data.seoul.go.kr',
      verified: '2026-10-30'
    },
    exhibition: {
      id: 'ex-003',
      venueId: 'junggu-003',
      title: '도심 속 풍경 사진전',
      start: '2026-10-20',
      end: '2026-11-10',
      field: '사진'
    },
    judgeResult: {
      result: 'unknown',
      reasons: ['상세 운영 시간 및 입장 마감 정보가 등록되지 않은 시설입니다. 공식 웹사이트를 확인해 주세요.']
    }
  }
];
