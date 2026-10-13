/**
 * Generic editor for a list of small objects (flights, price lines, add-ons...).
 *
 *  <RowsEditor
 *    title="Flights" items={form.flights} onChange={(v) => set('flights', v)}
 *    blank={{ sector: '', airline: '' }}
 *    fields={[{ key: 'sector', label: 'Sector', placeholder: 'DEL → IXL', span: 2 }, ...]}
 *  />
 *
 * Field types: text (default) | number | textarea | lines (array of strings, one per line)
 */
const linesToArr = (s) => s.split('\n').map(x => x.trim()).filter(Boolean)

export default function RowsEditor({ title, hint, items = [], onChange, blank, fields, addLabel = '+ Add', empty }) {
  const update = (i, key, value) => {
    const next = [...items]
    next[i] = { ...next[i], [key]: value }
    onChange(next)
  }
  const remove = (i) => onChange(items.filter((_, x) => x !== i))

  return (
    <div className="admin__rows">
      <div className="admin__form-block-head">
        <h3>{title}</h3>
        {hint && <span className="admin__sub">{hint}</span>}
        <button type="button" className="admin__btn" style={{ marginLeft: 'auto' }} onClick={() => onChange([...items, { ...blank }])}>{addLabel}</button>
      </div>
      {items.length === 0 && empty && <div className="admin__sub">{empty}</div>}
      {items.map((row, i) => (
        <div key={i} className="admin__row-card">
          <div className="admin__row-fields" style={{ gridTemplateColumns: `repeat(${fields.reduce((n, f) => n + (f.span || 1), 0) > 4 ? 4 : fields.reduce((n, f) => n + (f.span || 1), 0)}, 1fr)` }}>
            {fields.map(f => {
              const v = row[f.key]
              const common = { placeholder: f.placeholder, style: f.span ? { gridColumn: `span ${Math.min(f.span, 4)}` } : undefined }
              return (
                <label key={f.key} style={common.style}>
                  {f.label}
                  {f.type === 'textarea' ? (
                    <textarea rows={f.rows || 2} value={v ?? ''} placeholder={f.placeholder} onChange={e => update(i, f.key, e.target.value)} />
                  ) : f.type === 'lines' ? (
                    <textarea rows={f.rows || 3} value={(v || []).join('\n')} placeholder={f.placeholder} onChange={e => update(i, f.key, linesToArr(e.target.value))} />
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : 'text'}
                      value={v ?? ''}
                      placeholder={f.placeholder}
                      onChange={e => update(i, f.key, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                    />
                  )}
                </label>
              )
            })}
          </div>
          <button type="button" className="admin__btn admin__btn--danger admin__row-x" onClick={() => remove(i)} title="Remove">×</button>
        </div>
      ))}
    </div>
  )
}
