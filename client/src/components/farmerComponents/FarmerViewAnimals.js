import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


import './FarmerViewAnimals.css'; // Import CSS


function FarmerViewAnimals() {
    const [animals, setAnimals] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAnimal, setNewAnimal] = useState({
        Species: "",
        breed: "",
        approxDOB: "",
        nickName: "",
        profilePic: "",
    });

    const [editingAnimalId, setEditingAnimalId] = useState(null); // Track which animal is being edited
    const [editedAnimal, setEditedAnimal] = useState({});

    const [searchTerm, setSearchTerm] = useState("");
    const [sortKey, setSortKey] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isAddFormValid, setIsAddFormValid] = useState(false);
    const [isEditFormValid, setIsEditFormValid] = useState(false);

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

    // Function to get userId from JWT token
    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token not found in localStorage');
            return null;
        }
        try {
            const decoded = jwtDecode(token);
            return decoded.userId || null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchAnimals = async () => {
            setLoading(true);
            try {
                const userId = getUserIdFromToken();
                if (!userId) {
                    console.error('User ID not found in token');
                    setLoading(false);
                    return;
                }
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/animal/farmer/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
console.log('Fetched animals:', response.data); // Log the fetched animals
setAnimals(response.data);
            } catch (error) {
                console.error('Error fetching animals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimals();
    }, []);

    const calculateAge = (dob) => {
        if (!dob) return null;

        const birthDate = new Date(dob);
        const currentDate = new Date();

        let years = currentDate.getFullYear() - birthDate.getFullYear();
        let months = currentDate.getMonth() - birthDate.getMonth();

        if (months < 0 || (months === 0 && currentDate.getDate() < birthDate.getDate())) {
            years--;
            months += 12;
        }

        if (months < 0) {
            months = 12 + months;
        }

        // Return age in total months as a number
        return years * 12 + months;
    };

    // New helper function to format age in months to human-readable string
    const formatAge = (ageInMonths) => {
        if (ageInMonths == null) return "Unknown";
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        if (years === 0) {
            return `${months} month${months !== 1 ? 's' : ''}`;
        } else if (months === 0) {
            return `${years} year${years !== 1 ? 's' : ''}`;
        } else {
            return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
        }
    };

    // Validation helpers
    const validateAnimal = (animal) => {
        const errors = {};
        if (!animal.Species) errors.Species = "Species is required";
        if (!animal.approxDOB) errors.approxDOB = "Approximate DOB is required";
        return errors;
    };

    // Validate add form on newAnimal change
    useEffect(() => {
        const errors = validateAnimal(newAnimal);
        setFormErrors(errors);
        setIsAddFormValid(Object.keys(errors).length === 0);
    }, [newAnimal]);

    // Validate edit form on editedAnimal change
    useEffect(() => {
        const errors = validateAnimal(editedAnimal);
        setFormErrors(errors);
        setIsEditFormValid(Object.keys(errors).length === 0);
    }, [editedAnimal]);

    const handleAddAnimalClick = () => {
        setShowAddForm(true);
    };

    const handleCancelAddAnimal = () => {
        setShowAddForm(false);
        setNewAnimal({
            Species: "",
            breed: "",
            approxDOB: "",
            nickName: "",
            profilePic: "",
        });
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAnimal(prevAnimal => ({
            ...prevAnimal,
            [name]: value,
        }));

        if (name === 'Species') {
            setNewAnimal(prevAnimal => ({
                ...prevAnimal,
                profilePic: animalEmojis[value] || "",
            }));
        }
    };

    const handleAddAnimalSubmit = async (e) => {
        e.preventDefault();
        if (!isAddFormValid) return;
        try {
            const userId = getUserIdFromToken();
            if (!userId) {
                console.error('User ID not found in token');
                return;
            }
            const animalId = `animal${Date.now()}`;
            const age = calculateAge(newAnimal.approxDOB);
            const animalData = {
                animalId,
                Species: newAnimal.Species,
                breed: newAnimal.breed,
                nickName: newAnimal.nickName,
                approxDOB: newAnimal.approxDOB,
                age,
                owner: userId,
            };

            const token = localStorage.getItem('token');
            const response = await axios.post('/api/animal', animalData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAnimals(prevAnimals => [...prevAnimals, response.data]);
            setShowAddForm(false);
            setNewAnimal({
                Species: "",
                breed: "",
                approxDOB: "",
                nickName: "",
                profilePic: "",
            });
            setFormErrors({});
        } catch (error) {
            if (error.response && error.response.data) {
                console.error('Error adding animal:', error.response.data);
            } else {
                console.error('Error adding animal:', error);
            }
        }
    };

    const handleEditAnimal = (animalId) => {
        const animalToEdit = animals.find(animal => animal.animalId === animalId);
        if (animalToEdit) {
            setEditingAnimalId(animalId);
            // Format approxDOB to YYYY-MM-DD string for date input
            const formattedAnimal = {
                ...animalToEdit,
                approxDOB: animalToEdit.approxDOB ? new Date(animalToEdit.approxDOB).toISOString().split('T')[0] : '',
            };
            setEditedAnimal(formattedAnimal);
            setFormErrors({});
        }
    };

    const handleCancelEditAnimal = () => {
        setEditingAnimalId(null);
        setEditedAnimal({});
        setFormErrors({});
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditedAnimal(prevAnimal => ({
            ...prevAnimal,
            [name]: value,
        }));

        // Update profile pic if Species changes
        if (name === 'Species') {
            setEditedAnimal(prevAnimal => ({
                ...prevAnimal,
                profilePic: animalEmojis[value] || "",
            }));
        }
    };

    const handleSaveEditAnimal = async () => {
        if (!isEditFormValid) return;
        try {
            const age = calculateAge(editedAnimal.approxDOB);
            const updatedAnimalData = {
                ...editedAnimal,
                age,
                approxDOB: editedAnimal.approxDOB,
            };
            const token = localStorage.getItem('token');
            const response = await axios.put(`/api/animal/${editedAnimal.animalId}`, updatedAnimalData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAnimals(animals.map(animal =>
                animal.animalId === editedAnimal.animalId ? response.data : animal
            ));
            setEditingAnimalId(null);
            setEditedAnimal({});
            setFormErrors({});
        } catch (error) {
            console.error('Error updating animal:', error);
        }
    };

    const handleDeleteAnimal = async (animalId) => {
        if (!window.confirm("Are you sure you want to delete this animal?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/animal/${animalId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAnimals(animals.filter(animal => animal.animalId !== animalId));
        } catch (error) {
            console.error('Error deleting animal:', error);
        }
    };

    // Sorting and filtering logic
    const filteredAnimals = animals.filter(animal => {
        const search = searchTerm.toLowerCase();
        return (
            animal.nickName?.toLowerCase().includes(search) ||
            animal.Species?.toLowerCase().includes(search)
        );
    });

    const sortedAnimals = [...filteredAnimals].sort((a, b) => {
        if (!sortKey) return 0;
        let aVal = a[sortKey];
        let bVal = b[sortKey];
        if (sortKey === "age") {
            aVal = aVal || 0;
            bVal = bVal || 0;
        } else {
            aVal = aVal?.toString().toLowerCase() || "";
            bVal = bVal?.toString().toLowerCase() || "";
        }
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    // Handlers for search and sort
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        if (value === sortKey) {
            // toggle order
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(value);
            setSortOrder("asc");
        }
    };

    return (
        <div className="view-animals-container">
            <header className="animals-header">
                <h2>View Animals</h2>
                <button className="add-animal-button" onClick={handleAddAnimalClick} aria-label="Add Animal">
                    Add Animal
                </button>
            </header>

            {showAddForm && (
                <div className="add-animal-form" role="region" aria-label="Add Animal Form">
                    <form onSubmit={handleAddAnimalSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="Species">Species:</label>
                            <select
                                id="Species"
                                name="Species"
                                value={newAnimal.Species}
                                onChange={handleInputChange}
                                required
                                aria-describedby="speciesHelp"
                                aria-invalid={!!formErrors.Species}
                                title="Select the species of the animal"
                            >
                                <option value="">Select Species</option>
                                <option value="Cow">Cow</option>
                                <option value="Sheep">Sheep</option>
                                <option value="Horse">Horse</option>
                                <option value="Goat">Goat</option>
                                <option value="Pig">Pig</option>
                                <option value="Chicken">Chicken</option>
                                <option value="Cat">Cat</option>
                                <option value="Dog">Dog</option>
                                <option value="Rabbit">Rabbit</option>
                                <option value="Hamster">Hamster</option>
                                <option value="Parrot">Parrot</option>
                                <option value="Turtle">Turtle</option>
                                <option value="Fish">Fish</option>
                                <option value="Lizard">Lizard</option>
                            </select>
                            {formErrors.Species && <span className="error-message">{formErrors.Species}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="nickName">Nick Name:</label>
                            <input
                                type="text"
                                id="nickName"
                                name="nickName"
                                value={newAnimal.nickName}
                                onChange={handleInputChange}
                                placeholder="Enter nickname"
                                title="Optional nickname for the animal"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="breed">Breed:</label>
                            <input
                                type="text"
                                id="breed"
                                name="breed"
                                value={newAnimal.breed}
                                onChange={handleInputChange}
                                placeholder="Enter breed"
                                title="Optional breed of the animal"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="approxDOB">Approx. DOB:</label>
                            <input
                                type="date"
                                id="approxDOB"
                                name="approxDOB"
                                value={newAnimal.approxDOB}
                                onChange={handleInputChange}
                                required
                                aria-describedby="dobHelp"
                                aria-invalid={!!formErrors.approxDOB}
                                title="Select approximate date of birth"
                            />
                            {formErrors.approxDOB && <span className="error-message">{formErrors.approxDOB}</span>}
                        </div>
                        <div className="form-actions">
                            <button type="submit" disabled={!isAddFormValid} aria-disabled={!isAddFormValid}>
                                Add
                            </button>
                            <button type="button" onClick={handleCancelAddAnimal}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="search-sort-container" role="region" aria-label="Search and Sort Animals">
                <input
                    type="search"
                    placeholder="Search by nickname or species"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    aria-label="Search animals by nickname or species"
                />
                <select
                    value={sortKey}
                    onChange={handleSortChange}
                    aria-label="Sort animals"
                    title="Sort animals by species, age, or nickname"
                >
                    <option value="">Sort By</option>
                    <option value="Species">Species</option>
                    <option value="age">Age</option>
                    <option value="nickName">Nickname</option>
                </select>
                {sortKey && (
                    <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        aria-label={`Toggle sort order to ${sortOrder === "asc" ? "descending" : "ascending"}`}
                        title="Toggle sort order"
                    >
                        {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading-spinner" role="status" aria-live="polite" aria-label="Loading animals">
                    Loading...
                </div>
            ) : sortedAnimals.length === 0 ? (
                <div className="empty-state" role="alert" aria-live="polite">
                    No animals found. Please add some animals.
                </div>
            ) : (
                <div className="animal-cards-container">
                    {sortedAnimals.map(animal => (
                        <div className="animal-card" key={animal.animalId}>
                            <div className="animal-profile-pic" aria-label={`${animal.Species} icon`} role="img">
                                {animalEmojis[animal.Species] || animal.profilePic || "🐾"}
                            </div>

                            {editingAnimalId === animal.animalId ? (
                                // Edit Mode
                                <div className="animal-edit-form" role="region" aria-label="Edit Animal Form">
                                    <div className="form-group">
                                        <label htmlFor="Species-edit">Species:</label>
                                        <select
                                            id="Species-edit"
                                            name="Species"
                                            value={editedAnimal.Species}
                                            onChange={handleEditInputChange}
                                            required
                                            aria-describedby="speciesEditHelp"
                                            aria-invalid={!!formErrors.Species}
                                            title="Select the species of the animal"
                                        >
                                            <option value="">Select Species</option>
                                            <option value="Cow">Cow</option>
                                            <option value="Sheep">Sheep</option>
                                            <option value="Horse">Horse</option>
                                            <option value="Goat">Goat</option>
                                            <option value="Pig">Pig</option>
                                            <option value="Chicken">Chicken</option>
                                            <option value="Cat">Cat</option>
                                            <option value="Dog">Dog</option>
                                            <option value="Rabbit">Rabbit</option>
                                            <option value="Hamster">Hamster</option>
                                            <option value="Parrot">Parrot</option>
                                            <option value="Turtle">Turtle</option>
                                            <option value="Fish">Fish</option>
                                            <option value="Lizard">Lizard</option>
                                        </select>
                                        {formErrors.Species && <span className="error-message">{formErrors.Species}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="nickName-edit">Nick Name:</label>
                                        <input
                                            type="text"
                                            id="nickName-edit"
                                            name="nickName"
                                            value={editedAnimal.nickName}
                                            onChange={handleEditInputChange}
                                            placeholder="Enter nickname"
                                            title="Optional nickname for the animal"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="breed-edit">Breed:</label>
                                        <input
                                            type="text"
                                            id="breed-edit"
                                            name="breed"
                                            value={editedAnimal.breed}
                                            onChange={handleEditInputChange}
                                            placeholder="Enter breed"
                                            title="Optional breed of the animal"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="approxDOB-edit">DOB:</label>
                                        <input
                                            type="date"
                                            id="approxDOB-edit"
                                            name="approxDOB"
                                            value={editedAnimal.approxDOB || ''}
                                            onChange={handleEditInputChange}
                                            required
                                            aria-describedby="dobEditHelp"
                                            aria-invalid={!!formErrors.approxDOB}
                                            title="Select approximate date of birth"
                                        />
                                        {formErrors.approxDOB && <span className="error-message">{formErrors.approxDOB}</span>}
                                    </div>

                                    <div className="form-actions">
                                        <button onClick={handleSaveEditAnimal} disabled={!isEditFormValid} aria-disabled={!isEditFormValid}>
                                            Save
                                        </button>
                                        <button onClick={handleCancelEditAnimal}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <h3>{animal.nickName || animal.Species}</h3>
                                    <p>Species: {animal.Species}</p>
                                    <p>Breed: {animal.breed}</p>
                                    <p>Age: {formatAge(animal.age)}</p>
                                    <div className="animal-actions">
                                        <button onClick={() => handleEditAnimal(animal.animalId)} aria-label={`Edit ${animal.nickName || animal.Species}`}>
                                            ✏️ Edit
                                        </button>
                                        <button onClick={() => handleDeleteAnimal(animal.animalId)} aria-label={`Delete ${animal.nickName || animal.Species}`}>
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FarmerViewAnimals;
