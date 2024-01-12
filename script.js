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
const saveResult = () => {
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
        const existingIndex = savedResults.findIndex(result => result.split(" ")[1] === name);
        if (existingIndex !== -1) {
            // Check if the prefix matches, if not, update only the prefix
            const existingPrefix = savedResults[existingIndex].split(" ")[0];
            const newPrefix = selectedGender === "male" ? "Mr." : "Ms.";
            if (existingPrefix !== newPrefix) {
                savedResults[existingIndex] = resultToSave;
                showMessage(`The prefix for "${name}" was updated.`);
            } else {
                showMessage(`The name "${name}" is updated.`);
            }
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
};

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
    ELEMENTS.saveButton.addEventListener("click", saveResult);
    ELEMENTS.genderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        predictGender();
    });
    displaySavedResults();
});
