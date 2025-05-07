import React, { useState, useEffect, useRef } from 'react';
import './ReportEmergencyPage.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const animalEmojis = {
    Cow: "🐄",
    Sheep: "🐑",
    Horse: "🐴",
    Goat: "🐐",
    Pig: "🐖",
    Chicken: "🐔",
    Cat: "🐈",
    Dog: "🐕",
    Rabbit: "🐇",
    Hamster: "🐹",
    Parrot: "🦜",
    Turtle: "🐢",
    Fish: "🐟",
    Lizard: "🦎",
};


function ReportEmergencyPage() {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [map, setMap] = useState(null);
  const [mapMarker, setMapMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);


  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('');


  const mapRef = useRef(null);
  const bhadrakCoordinates = [21.061807778179173, 86.50237574377937];


  useEffect(() => {
    // Fetch farmer's animals
    const fetchAnimals = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('User not logged in');
          return;
        }
        const response = await fetch("http://localhost:5000/api/animal/farmer/" + userId, {
          headers: { Authorization: "Bearer " + token },
        });
        if (response.ok) {
          const data = await response.json();
          setAnimals(data);
        } else {
          setError('Failed to fetch animals');
        }
      } catch (err) {
        setError('Failed to fetch animals');
      }
    };
    fetchAnimals();
  }, []);


  useEffect(() => {
    if (mapRef.current) {
      if (mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
      }
      if (map) {
        map.remove();
      }
      const existingMap = L.DomUtil.get(mapRef.current);
      if (existingMap && existingMap._leaflet_id) {
        existingMap._leaflet_id = null;
      }
    }


    let newMap = null;


    if (!map && mapRef.current) {
      newMap = L.map(mapRef.current).setView(bhadrakCoordinates, 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(newMap);
      newMap.locate({ setView: true, maxZoom: 16 });
      newMap.on('locationfound', onLocationFound);
      newMap.on('locationerror', (e) => {
        alert("Location access denied.");
      });
      newMap.on('click', handleMapClick);
      setMap(newMap);
    }


    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);


  const onLocationFound = (e) => {
    const latitude = e.coords?.latitude;
    const longitude = e.coords?.longitude;


    if (latitude !== undefined && longitude !== undefined) {
      setLocation(latitude + ", " + longitude);
      if (mapMarker) {
        mapMarker.setLatLng([latitude, longitude]);
      } else {
        const newMarker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
        setMapMarker(newMarker);
      }
      map.panTo([latitude, longitude]);
    }
  };


  const handleMapClick = (e) => {
    const lat = e.latlng?.lat;
    const lng = e.latlng?.lng;


    if (lat !== undefined && lng !== undefined) {
      setLocation(lat + ", " + lng);
      if (mapMarker) {
        mapMarker.setLatLng(e.latlng);
      } else {
        const newMarker = L.marker(e.latlng, { draggable: true }).addTo(map);
        setMapMarker(newMarker);
      }
    }
  };


  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };


  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };


  const handleSortChange = (e) => {
    setSortKey(e.target.value);
  };


  const handleAnimalSelection = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    if (checked) {
      const animal = animals.find(a => a._id === value);
      if (animal && !selectedAnimals.some(a => a._id === value)) {
        setSelectedAnimals([...selectedAnimals, animal]);
      }
    } else {
      setSelectedAnimals(selectedAnimals.filter(a => a._id !== value));
    }
  };


  // Extended filter to include breed, nickname, species, and type
  const filteredAnimals = animals.filter(animal => {
    const matchesType = filterType ? animal.type === filterType : true;
    const search = searchTerm.toLowerCase();
    const matchesSearch = search
      ? (animal.nickName?.toLowerCase().includes(search) ||
        animal.breed?.toLowerCase().includes(search) ||
        animal.type?.toLowerCase().includes(search) ||
        animal.species?.toLowerCase().includes(search))
      : true;
    return matchesType && matchesSearch;
  });


  // Sorting logic
  const sortedAnimals = [...filteredAnimals].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });


  const handleRemoveSelectedAnimal = (id) => {
    setSelectedAnimals(selectedAnimals.filter(a => a._id !== id));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);


    if (selectedAnimals.length === 0 || !location || !description) {
      setError('Please fill in all required fields and select at least one animal.');
      setLoading(false);
      return;
    }


    const animalsData = selectedAnimals.map(a => ({
      animalType: a.Species || '',
      breed: a.breed || '',
      age: a.age || 0,
    }));


    const formData = new FormData();
    formData.append('animals', JSON.stringify(animalsData));
    formData.append('location', location);
    formData.append('description', description);
    if (image) {
      formData.append('images', image);
    }
    if (video) {
      formData.append('videos', video);
    }


    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/emergency', {
        method: 'POST',
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      });


      if (response.ok) {
        setSuccessMessage('Emergency report submitted successfully!');
        setSubmitSuccess(true);
        setSelectedAnimals([]);
        setLocation('');
        setDescription('');
        setImage(null);
        setVideo(null);
        if (mapMarker) {
          mapMarker.remove();
          setMapMarker(null);
        }
        setDropdownOpen(false);
        setFilterType('');
        setSearchTerm('');
        setSortKey('');
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        setError(errorData.message || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="report-emergency-container">
      <div className="report-emergency-form">
        <h2>Report an Animal Emergency</h2>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label> Select Animals (You can select multiple): </label>
            <button
              type="button"
              className="dropdown-toggle"
              onClick={toggleDropdown}
              aria-expanded={dropdownOpen}
              aria-controls="animal-dropdown"
              aria-label="Toggle animal selection dropdown"
            >
              +
            </button>
            {dropdownOpen && (
              <div
                className="animal-dropdown"
                id="animal-dropdown"
                role="region"
                aria-label="Animal selection dropdown"
              >
                <div className="filter-search-container">
                  <select
                    value={filterType}
                    onChange={handleFilterChange}
                    aria-label="Filter animals by type"
                  >
                    <option value="">All Types</option>
                    {[...new Set(animals.map(a => a.type))].map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="search"
                    placeholder="Search by name, breed, species"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    aria-label="Search animals by name, breed, or species"
                  />
                  <select
                    value={sortKey}
                    onChange={handleSortChange}
                    aria-label="Sort animals"
                  >
                    <option value="">Sort By</option>
                    <option value="type">Type</option>
                    <option value="breed">Breed</option>
                    <option value="nickName">Nickname</option>
                  </select>
                </div>
                <div className="animal-selection-list-dropdown">
                  {sortedAnimals.length === 0 && <p>No animals found.</p>}
                  {sortedAnimals.map(animal => (
                    <div key={animal._id} className="animal-checkbox-dropdown">
                      <input
                        type="checkbox"
                        id={"dropdown-" + animal._id}
                        value={animal._id}
                        checked={selectedAnimals.some(a => a._id === animal._id)}
                        onChange={handleAnimalSelection}
                      />
                      <label htmlFor={"dropdown-" + animal._id}>
                        <span role="img" aria-label={animal.type || animal.species || 'animal'}>
                          {animalEmojis[animal.type] || animalEmojis[animal.species] || ""}
                        </span>{" "}
                        {animalEmojis[animal.Species] || animalEmojis[animal.type] || ""}{" "}
                        {animal.Species || animal.type} - {animal.breed} - {animal.nickName || 'No Name'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="selected-animals-list" aria-live="polite" aria-label="Selected animals">
              {selectedAnimals.length === 0 && <p>No animals selected.</p>}
              {selectedAnimals.map(animal => (
                <div key={animal._id} className="selected-animal-item">
                  <span role="img" aria-label={animal.Species || animal.type || 'animal'}>
                    {animalEmojis[animal.Species] || animalEmojis[animal.type] || ""}
                  </span>{" "}
                  {animal.Species || animal.type} - {animal.nickName || 'No Name'}
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedAnimal(animal._id)}
                    aria-label={`Remove ${animal.nickName || animal.type || animal.species}`}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
            <a href="/farmer/profile" className="add-animals-link">
              Add or manage your animals
            </a>
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description of Emergency</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="image">Upload Image (Optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label htmlFor="video">Upload Video (Optional)</label>
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <div ref={mapRef} style={{ height: '300px' }}></div>
          </div>
          <button
            type="submit"
            className={`report-button ${submitSuccess ? 'submit-success' : ''}`}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Submitting...' : submitSuccess ? 'Report Submitted!' : 'Submit Emergency Report'}
          </button>
        </form>
      </div>
    </div>
  );
}


export default ReportEmergencyPage;


