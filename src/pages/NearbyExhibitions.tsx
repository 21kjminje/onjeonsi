import { useEffect, useRef, useState } from 'react'
import exhibitions from '../../data/exhibitions/auto.json'
import { mockItems } from '../mock/data'
import './NearbyExhibitions.css'

declare global {
  interface Window { kakao: any }
}

const GWANGHWAMUN = { lat: 37.5759, lng: 126.9768 }
const RADIUS_OPTIONS = [500, 1000, 2000]

const JUDGE_LABEL = {
  possible: '가능',
  impossible: '불가',
  unknown: '확인 필요',
}

// 하버사인 공식으로 두 좌표 사이 거리(m)를 구한다
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

function NearbyExhibitions() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapObj = useRef<any>(null)
  const layers = useRef<any[]>([])
  const [ready, setReady] = useState(false)
  const [center, setCenter] = useState(GWANGHWAMUN)
  const [label, setLabel] = useState('광화문')
  const [radius, setRadius] = useState(1000)

  const today = new Date().toISOString().slice(0, 10)

  const nearby = exhibitions
    .filter(
      (ex) =>
        ex.lat && ex.lng &&
        ex.start <= today && today <= ex.end &&
        distanceMeters(center.lat, center.lng, ex.lat, ex.lng) <= radius
    )
    .map((ex) => ({
      ...ex,
      distance: distanceMeters(center.lat, center.lng, ex.lat!, ex.lng!),
    }))
    .sort((a, b) => a.distance - b.distance)
    // 판정 함수가 아직 없어 mock/data.ts의 결과 3개를 돌려 쓴다
    .map((ex, i) => ({ ...ex, judge: mockItems[i % mockItems.length].judgeResult }))

  // 한 장소에서 전시가 여러 개 열리므로 좌표 단위로 묶는다
  const spots = Object.values(
    nearby.reduce<Record<string, typeof nearby>>((acc, ex) => {
      const key = `${ex.lat},${ex.lng}`
      ;(acc[key] ||= []).push(ex)
      return acc
    }, {})
  )

  function useMyLocation() {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 현재 위치를 쓸 수 없습니다.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLabel('현재 위치')
      },
      () => alert('위치 권한이 거부되었습니다.')
    )
  }


  useEffect(() => {
    window.kakao.maps.load(() => {
      if (mapObj.current) return
      const map = new window.kakao.maps.Map(mapRef.current!, {
        center: new window.kakao.maps.LatLng(GWANGHWAMUN.lat, GWANGHWAMUN.lng),
        level: 6,
        disableDoubleClickZoom: true, // 더블클릭은 기준 위치 옮기기에 쓴다
      })
      window.kakao.maps.event.addListener(map, 'dblclick', (e: any) => {
        setCenter({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
        setLabel('지도에서 선택한 위치')
      })
      mapObj.current = map
      setReady(true)
    })
  }, [])


  useEffect(() => {
    const map = mapObj.current
    if (!map) return

    layers.current.forEach((o) => o.setMap(null))
    layers.current = []

    const pos = new window.kakao.maps.LatLng(center.lat, center.lng)
    map.setCenter(pos)

    const circle = new window.kakao.maps.Circle({
      center: pos,
      radius,
      strokeWeight: 2,
      strokeColor: '#555',
      strokeOpacity: 0.7,
      fillColor: '#555',
      fillOpacity: 0.06,
      map,
    })
    layers.current.push(circle)

   
    const dot = new window.kakao.maps.CustomOverlay({
      position: pos,
      content: '<div class="center-dot"></div>',
      zIndex: 10,
      map,
    })
    layers.current.push(dot)

    const info = new window.kakao.maps.InfoWindow({ removable: true })
    layers.current.push(info)
    let openedId: string | null = null

    spots.forEach((items) => {
      // 여러 전시가 겹치면 가장 좋은 판정을 핀 색으로 쓴다
      const best =
        items.find((x) => x.judge.result === 'possible') ??
        items.find((x) => x.judge.result === 'unknown') ??
        items[0]

      const position = new window.kakao.maps.LatLng(items[0].lat, items[0].lng)

      const pin = document.createElement('div')
      pin.className = `pin ${best.judge.result}`
      if (items.length > 1) {
        pin.innerHTML = `<span>${items.length}</span>`
      }

      const marker = new window.kakao.maps.CustomOverlay({
        position,
        content: pin,
        yAnchor: 1,
        clickable: true,
        map,
      })
      layers.current.push(marker)

      // 카카오는 mousedown 으로도 지도 클릭을 잡으므로 함께 막는다
      ;['mousedown', 'touchstart'].forEach((type) =>
        pin.addEventListener(type, (e) => e.stopPropagation())
      )

      const spotId = items[0].id
      pin.addEventListener('click', (e) => {
        e.stopPropagation()
        if (openedId === spotId) {
          info.close()
          openedId = null
          return
        }
        const rows = items
          .map(
            (ex) =>
              `<div class="info-row">` +
                `<span class="badge ${ex.judge.result}">${JUDGE_LABEL[ex.judge.result]}</span>` +
                `<span>${ex.title}</span>` +
              `</div>`
          )
          .join('')
        info.setContent(
          `<div class="info-box"><strong>${items[0].placeName}</strong>${rows}</div>`
        )
        info.setPosition(position)
        info.open(map)
        openedId = spotId
      })
    })
  }, [ready, center, radius])

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="filter">
          <h1>{label}</h1>

          <div className="place">
            <button onClick={useMyLocation}>현재 위치</button>
            <button
              onClick={() => {
                setCenter(GWANGHWAMUN)
                setLabel('광화문')
              }}
            >
              광화문
            </button>
          </div>
          <p className="hint">지도를 두 번 누르면 그 자리가 기준이 됩니다</p>

          <div className="radius">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                className={r === radius ? 'on' : ''}
                onClick={() => setRadius(r)}
              >
                {r < 1000 ? `${r}m` : `${r / 1000}km`}
              </button>
            ))}
          </div>

          <p className="count">전시 {nearby.length}건</p>
        </div>

        {nearby.map((ex) => {
          const judge = ex.judge

          return (
            <article key={ex.id} className="item">
              <div className="meta">
                <span className={`badge ${judge.result}`}>
                  {JUDGE_LABEL[judge.result]}
                </span>
                <span className="dist">{Math.round(ex.distance)}m</span>
              </div>
              <h2>{ex.title}</h2>
              <p className="venue">{ex.placeName}</p>
              {judge.reasons.map((reason, j) => (
                <p key={j} className="reason">· {reason}</p>
              ))}
            </article>
          )
        })}

        {nearby.length === 0 && (
          <p className="empty">이 범위에 오늘 볼 수 있는 전시가 없습니다.</p>
        )}
      </aside>

      <div ref={mapRef} className="map" />
    </div>
  )
}

export default NearbyExhibitions
