// Constants for element references
const ELEMENTS = {
    savedResult: document.getElementById("savedResult"),
    predictionResult: document.getElementById("predictionResult"),
    messageArea: document.getElementById("messageArea"),
    nameInput: document.getElementById("nameInput"),
    predictButton: document.getElementById("predictButton"),
    saveButton: document.getElementById("saveButton"),
    genderForm: document.getElementById("genderForm")
};

// Function to show a message
const showMessage = (message) => {
    ELEMENTS.messageArea.textContent = message;
    ELEMENTS.messageArea.style.display = 'block';
    setTimeout(() => {
        ELEMENTS.messageArea.style.display = 'none';
    }, 5000);
};

// Function to predict gender
const predictGender = async () => {
    const nameInput = ELEMENTS.nameInput;
    const name = nameInput.value.trim();
    const validNamePattern = /^[A-Za-z-]+$/;
    if (!name) {
        showMessage("Please enter a name.");
        return;
    }
    if (!validNamePattern.test(name)) {
        showMessage("Name can only contain English letters and hyphens.");
        return;
    }
    try {
        const response = await fetch(`https://api.genderize.io/?name=${name}`);
        const data = await response.json();
        if (data.gender) {
            const result = data.gender === "male" ? `Mr. ${name}` : `Ms. ${name}`;
            ELEMENTS.predictionResult.textContent = `${result} (${data.probability * 100}%)`;
            // Set the gender radio buttons
            document.getElementById('maleOption').checked = data.gender === "male";
            document.getElementById('femaleOption').checked = data.gender === "female";
        } else {
            showMessage("Gender could not be predicted.");
        }
    } catch (error) {
        console.error("Error:", error);
        showMessage("Error occurred. Please try again.");
    }
};

// Function to save or update result with priority given to the gender radio input

// Function to clear saved results
const clearSavedResults = () => {
    localStorage.removeItem("savedResults");
    ELEMENTS.savedResult.innerHTML = '';
    showMessage("All saved results have been cleared.");
};

// Function to display saved results
const displaySavedResults = () => {
    const savedResults = JSON.parse(localStorage.getItem("savedResults")) || [];
    ELEMENTS.savedResult.innerHTML = '<ol>' + savedResults.map(result => `<li>${result}</li>`).join('') + '</ol>';
};

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
    ELEMENTS.predictButton.addEventListener("click", predictGender);
    ELEMENTS.saveButton.addEventListener("click", (() => {
    const name = ELEMENTS.nameInput.value.trim();
    const genderOptions = document.getElementsByName('gender');
    let selectedGender = '';
    for (const option of genderOptions) {
        if (option.checked) {
            selectedGender = option.value;
            break;
        }
    }
    const resultToSave = selectedGender === "male" ? `Mr. ${name}` : `Ms. ${name}`;
    
    if (name && selectedGender) {
        let savedResults = JSON.parse(localStorage.getItem("savedResults")) || [];
        // Find index of existing entry with the same name
        const existingIndex = savedResults.findIndex(result => {
            // Check if the result has a space
            if (result.includes(' ')) {
                // Extract the name part from the result (after the prefix)
                const resultName = result.split(' ')[1];
                return resultName === name;
            }
            // If the result doesn't have a space, it's not a match
            return false;
        });
        if (existingIndex !== -1) {
            // Update existing entry with new gender selection
            savedResults[existingIndex] = resultToSave;
            showMessage(`The name "${name}" was previously saved and has now been updated.`);
        } else {
            // Add new entry
            savedResults.push(resultToSave);
            showMessage(`The name "${name}" has been saved.`);
        }
        localStorage.setItem("savedResults", JSON.stringify(savedResults));
        displaySavedResults(); // Refresh the saved list
    } else {
        showMessage("Please enter a name and select a gender.");
    }
}));
    ELEMENTS.genderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        predictGender();
    });
    displaySavedResults();
});
