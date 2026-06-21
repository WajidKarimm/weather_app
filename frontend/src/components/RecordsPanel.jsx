import { useState, useEffect } from 'react';
import { getRecords, createRecord, updateRecord, deleteRecord, getExportUrl } from '../api';
import { formatTemp, getWeatherIcon } from '../utils/weather';

export default function RecordsPanel() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ location: '', start_date: '', end_date: '' });

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      setRecords(await getRecords());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  const openForm = (record = null) => {
    if (record) {
      setForm({ location: record.location_query, start_date: record.start_date, end_date: record.end_date });
      setEditingId(record.id);
    } else {
      setForm({ location: '', start_date: today, end_date: nextWeek });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateRecord(editingId, {
          location_query: form.location,
          start_date: form.start_date,
          end_date: form.end_date,
        });
      } else {
        await createRecord(form);
      }
      setShowForm(false);
      setEditingId(null);
      loadRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await deleteRecord(id);
      loadRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="saved-screen" aria-label="Saved weather records">
      <div className="screen-title">
        <h2>Saved</h2>
        <p>{records.length} record{records.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="saved-toolbar">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => showForm ? setShowForm(false) : openForm()}>
          {showForm ? 'Cancel' : '+ New Record'}
        </button>
        <ExportDropdown />
      </div>

      {error && <div className="toast-error inline" role="alert"><p>{error}</p></div>}

      {showForm && (
        <form className="record-form glass-card" onSubmit={handleSubmit}>
          <h4>{editingId ? 'Edit Record' : 'New Record'}</h4>
          <label>
            Location
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City, zip, coordinates…"
              required
            />
          </label>
          <div className="form-dates">
            <label>
              Start
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
            </label>
            <label>
              End
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {editingId ? 'Save Changes' : 'Save Record'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="empty-text">Loading…</p>
      ) : records.length === 0 ? (
        <div className="empty-saved glass-card">
          <span aria-hidden="true">📭</span>
          <p>No saved records yet.</p>
        </div>
      ) : (
        <ul className="record-list">
          {records.map((r) => (
            <li key={r.id} className="record-row glass-card">
              <div className="record-top">
                <span className="record-icon" aria-hidden="true">
                  {getWeatherIcon(r.forecast_data?.[0]?.weatherCode ?? 0)}
                </span>
                <div className="record-info">
                  <strong>{r.location_name}{r.country ? `, ${r.country}` : ''}</strong>
                  <span>{formatTemp(r.current_temp)} · {r.weather_description}</span>
                  <span className="record-dates">{r.start_date} → {r.end_date}</span>
                </div>
              </div>
              <div className="record-actions">
                <button type="button" className="chip-btn" onClick={() => openForm(r)}>Edit</button>
                <button type="button" className="chip-btn danger" onClick={() => handleDelete(r.id)}>Delete</button>
              </div>
              {(r.map_data || r.youtube_videos) && (
                <div className="record-links">
                  {r.map_data && (
                    <a href={r.map_data.googleMapsUrl} target="_blank" rel="noopener noreferrer">📍 Map</a>
                  )}
                  {r.youtube_videos?.videos?.[0] ? (
                    <a href={r.youtube_videos.videos[0].url} target="_blank" rel="noopener noreferrer">▶ YouTube</a>
                  ) : r.youtube_videos?.searchUrl ? (
                    <a href={r.youtube_videos.searchUrl} target="_blank" rel="noopener noreferrer">▶ YouTube</a>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ExportDropdown() {
  const formats = ['json', 'csv', 'xml', 'markdown', 'pdf'];
  return (
    <select
      className="export-select"
      defaultValue=""
      aria-label="Export records"
      onChange={(e) => {
        if (e.target.value) {
          window.open(getExportUrl(e.target.value), '_blank');
          e.target.value = '';
        }
      }}
    >
      <option value="" disabled>Export</option>
      {formats.map((f) => (
        <option key={f} value={f}>{f.toUpperCase()}</option>
      ))}
    </select>
  );
}
