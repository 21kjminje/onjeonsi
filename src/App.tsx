import { useEffect, useRef } from 'react'
import exhibitions from '../data/exhibitions/auto.json'
import { mockItems } from './mock/data'

declare global {
  interface Window { kakao: any }
}

const CENTER = { lat: 37.5759, lng: 126.9768 } // 광화문
const RADIUS = 1000 // 미터

// 판정 결과별 표시
const JUDGE_STYLE = {
  possible:   { text: '가능',      bg: '#e0f0e8', fg: '#2f7a5a' },
  impossible: { text: '불가',      bg: '#fbe6e1', fg: '#b0442f' },
  unknown:    { text: '확인 필요', bg: '#e9edf3', fg: '#5a6476' },
}


// 두 좌표 사이 거리(m) — 하버사인 공식 (지구를 구로 보고 두 점 사이 거리를 재는 공식)
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function App() {
  const mapRef = useRef<HTMLDivElement>(null)

  // auto.json에서 반경 안에 있는 전시만 남긴다
  const TODAY = new Date().toISOString().slice(0, 10)  // '2026-11-08'
  const nearby = exhibitions.filter(
      (ex) =>
        ex.lat && ex.lng &&
      ex.start <= TODAY && TODAY <= ex.end && // 오늘(TODAY) 진행 중인 전시만
        distanceMeters(CENTER.lat, CENTER.lng, ex.lat, ex.lng) <= RADIUS
    )
    .map((ex) => ({
      ...ex,
      distance: distanceMeters(CENTER.lat, CENTER.lng, ex.lat!, ex.lng!),
    }))
    .sort((a, b) => a.distance - b.distance)
  console.log(`반경 ${RADIUS}m 안: ${nearby.length}건 / 전체 ${exhibitions.length}건`)


  // 지도 시각화 초기화
  useEffect(() => {
    window.kakao.maps.load(() => {
      const center = new window.kakao.maps.LatLng(CENTER.lat, CENTER.lng)
      const map = new window.kakao.maps.Map(mapRef.current!, { center, level: 6 })

      // 반경 원
      new window.kakao.maps.Circle({
        center,
        radius: RADIUS,
        strokeWeight: 2,
        strokeColor: '#3d5a8a',
        strokeOpacity: 0.8,
        fillColor: '#3d5a8a',
        fillOpacity: 0.08,
        map,
      })


      const info = new window.kakao.maps.InfoWindow({ removable: true })
      let openedId: string | null = null

      nearby.forEach((ex) => {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(ex.lat, ex.lng),
          map,
        })
        window.kakao.maps.event.addListener(marker, 'click', () => {
          if (openedId === ex.id) {
            info.close()
            openedId = null
            return
          }
          info.setContent(
            `<div style="padding:8px 12px;font-size:13px;line-height:1.5;max-width:220px;white-space:normal;word-break:keep-all">${ex.title}</div>`
          )
          info.open(map, marker)
          openedId = ex.id
        })
      })
    })
  }, [])

  return <div style={{ display: 'flex', height: '100vh' }}>
          <aside style={{ width: 360, overflowY: 'auto', borderRight: '1px solid #ddd' }}> 
              <div style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
                <div style={{ fontWeight: 700 }}>광화문 · 반경 1km</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                  전시 {nearby.length}건
                </div>
              </div>

                {nearby.map((ex, i) => {
                  // 판정 함수가 아직 없으므로 가짜 결과를 돌려 쓴다
                  const judge = mockItems[i % mockItems.length].judgeResult
                  const badge = JUDGE_STYLE[judge.result]

                  return (
                    <div key={ex.id} style={{ padding: 16, borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.fg,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 4,
                          }}
                        >
                          {badge.text}
                        </span>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {Math.round(ex.distance)}m
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginTop: 8 }}>
                        {ex.title}
                      </div>
                      <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
                        {ex.placeName}
                      </div>

                      {judge.reasons.map((reason, j) => (
                        <div key={j} style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                          · {reason}
                        </div>
                      ))}
                    </div>
                  )
                })}

          </aside>
          <div ref={mapRef} style={{ flex: 1 }} />
        </div>
}

export default App