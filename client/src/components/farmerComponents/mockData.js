// mockData.js
export const mockFarmerProfile = {
    userId: "farmer123",
    userName: "John Doe",
    contactInfo: "john.doe@email.com",
    farmerLocation: "Rural Area 1",
    additionalInfo: "Has mixed livestock",
};

export const mockAnimals = [
    {
        animalId: "animal001",
        Species: "Cow", // Corrected spelling
        breed: "Holstein",
        age: 5,
        owner: "farmer123",
    },
    {
        animalId: "animal002",
        Species: "Goat", // Corrected spelling
        breed: "Alpine",
        age: 2,
        owner: "farmer123",
    },
];

export const mockReports = [
    {
        emergencyld: "report001",
        Description: "Calf with fever",
        Location: "Barn A",
        Status: "Acknowledged",
    },
    {
        emergencyld: "report002",
        Description: "Lame sheep",
        Location: "Pasture 2",
        Status: "En Route",
    },
];