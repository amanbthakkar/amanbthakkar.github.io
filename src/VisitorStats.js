import React, { useState } from 'react';
import './VisitorStats.css';

function VisitorStats({ total, baseline, live, sources, offline, showBreakdown }) {
  const [expanded, setExpanded] = useState(false);

  const displayTotal =
    total !== undefined && total !== null
      ? total
      : (baseline || 0) + (live || 0);

  return (
    <div className='visitor-stats'>
      <h6 className='text-center mb-0'>
        Site visits: <strong>{displayTotal}</strong>
        {offline && (
          <span className='offline-badge' title='Backend unreachable — showing last known baseline'>
            {' '}
            (cached)
          </span>
        )}
        {showBreakdown && sources && sources.length > 0 && (
          <button
            type='button'
            className='stats-toggle btn btn-link btn-sm text-white p-0 ms-2'
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide' : 'Sources'}
          </button>
        )}
      </h6>

      {expanded && sources && sources.length > 0 && (
        <ul className='stats-list list-unstyled small mt-2 mb-0'>
          {sources.map((s) => (
            <li key={s.key} className='stats-row'>
              <span className='stats-label'>{s.label}</span>
              <span className='stats-count'>
                {s.count}
                {s.percent != null && (
                  <span className='stats-pct'> ({s.percent}%)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VisitorStats;
