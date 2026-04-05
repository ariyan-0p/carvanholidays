import { useState } from 'react'
import './SearchBar.css'

const tabs = ['Holidays', 'Flights', 'Hotels', 'Visa']

const holidayDestinations = [
  'Bali', 'Maldives', 'Thailand', 'Dubai', 'Europe',
  'Goa', 'Kerala', 'Rajasthan', 'Ladakh', 'Andaman',
]

export default function SearchBar() {
  const [activeTab, setActiveTab] = useState('Holidays')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [travelers, setTravelers] = useState('2 Adults')

  return (
    <section className="search" id="book">
      <div className="search__card">
        {/* Tabs */}
        <div className="search__tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`search__tab ${activeTab === tab ? 'search__tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="search__tab-icon">{tabIcon(tab)}</span>
              {tab}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="search__fields">
          <div className="search__field">
            <label className="search__field-label">Travelling From</label>
            <input
              className="search__input"
              type="text"
              placeholder="Your city"
              value={from}
              onChange={e => setFrom(e.target.value)}
            />
          </div>

          <div className="search__divider">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="search__field">
            <label className="search__field-label">Destination</label>
            <input
              className="search__input"
              type="text"
              placeholder="Where do you want to go?"
              list="destinations"
              value={to}
              onChange={e => setTo(e.target.value)}
            />
            <datalist id="destinations">
              {holidayDestinations.map(d => <option key={d} value={d} />)}
            </datalist>
          </div>

          <div className="search__field">
            <label className="search__field-label">Travel Date</label>
            <input
              className="search__input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="search__field">
            <label className="search__field-label">Travellers</label>
            <select
              className="search__input search__select"
              value={travelers}
              onChange={e => setTravelers(e.target.value)}
            >
              <option>1 Adult</option>
              <option>2 Adults</option>
              <option>2 Adults, 1 Child</option>
              <option>2 Adults, 2 Children</option>
              <option>Group (5+)</option>
            </select>
          </div>

          <button className="search__btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Search
          </button>
        </div>

        {/* Popular searches */}
        <div className="search__popular">
          <span className="search__popular-label">Popular:</span>
          {['Bali', 'Maldives', 'Goa', 'Thailand', 'Europe'].map(dest => (
            <button key={dest} className="search__tag" onClick={() => setTo(dest)}>
              {dest}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function tabIcon(tab) {
  switch (tab) {
    case 'Holidays': return '🏖️'
    case 'Flights':  return '✈️'
    case 'Hotels':   return '🏨'
    case 'Visa':     return '📋'
    default:         return '🌍'
  }
}
