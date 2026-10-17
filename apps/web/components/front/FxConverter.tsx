'use client'

import { useId, useState } from 'react'

/** USD ⇄ MXN converter. Typing in either box updates the other. */
export function FxConverter({ rate, locale, labels }: { rate: number; locale: string; labels: { usd: string; mxn: string } }) {
  const id = useId()
  const [usd, setUsd] = useState('100')
  const [mxn, setMxn] = useState(() => (100 * rate).toFixed(2))
  const parse = (s: string) => Number(s.replace(',', '.'))
  const fmt = (n: number, d: number) => (Number.isFinite(n) ? String(Math.round(n * 10 ** d) / 10 ** d) : '')
  void locale
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
      <label className="fp-field" htmlFor={`${id}-usd`}>{labels.usd}
        <input id={`${id}-usd`} inputMode="decimal" value={usd}
          onChange={e => { setUsd(e.target.value); const v = parse(e.target.value); setMxn(e.target.value === '' ? '' : fmt(v * rate, 2)) }} />
      </label>
      <label className="fp-field" htmlFor={`${id}-mxn`}>{labels.mxn}
        <input id={`${id}-mxn`} inputMode="decimal" value={mxn}
          onChange={e => { setMxn(e.target.value); const v = parse(e.target.value); setUsd(e.target.value === '' ? '' : fmt(v / rate, 2)) }} />
      </label>
    </div>
  )
}
