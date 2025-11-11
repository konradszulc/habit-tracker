// Get the element with ID "rows" for later use in function
const rows = document.getElementById("rows");

//Motivational quotes array
const writtenQuotes = [
    "Believe in yourself, you are the best!",
    "One day at a time, one step at a time.",
    "You can always improve, keep going!",
    "Be proud of yourself.",
    "Just Do It!",
    "Every day is a new opportunity."
];

//Initialize state from localStorage, if not present, will use default which is an empty array of habits, let is better than const, since the variable will be reassigned during
let state = JSON.parse(localStorage.getItem("habitTrackerState")) || { habits: [] };

//function to save current state to localStorage
function saveState(stateObj) {
    localStorage.setItem("habitTrackerState", JSON.stringify(stateObj));//this saves the state object as a JSON string in localStorage under key "habitTrackerState"
}

//Get the motivational quote section element
const quoteSection = document.getElementById("motivational-quote");

//function to fetch random quote from quotes array
function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * writtenQuotes.length);//generates random index based on length of quotes array
    return writtenQuotes[randomIndex];//returns the quote at the random index
}

//function to grab current date in YYYY-MM-DD format
function todayKey() {
    const d = new Date(); //d assigned to current date
    return d.toISOString().split("T")[0];//removes the time portion, returns only date in YYYY-MM-DD format
}

//Need Array of last 7 days for habit traker weekly view
function getWeekKeys() {
    const keys = []; //Initialize empty array to hold date keys
    const d = new Date(); //d assigned to current date
    //for loop, to get last 7 days, 0 is today, 6 is 6 days ago
    for (let i = 6; i >= 0; i--) {
        const date = new Date(d); //this creates a new date variable based on current date
        date.setDate(date.getDate() - i); //sets date to current date minus i days which i keeps getting smaller each iteration
        keys.push(date.toISOString().split("T")[0]); //pushes formatted date string to keys array
    }
    return keys; //this returns the array of last 7 days (inlcludes today)
}

//call the getWeekKeys function to get last 7 days date keys and assigns to weekKeys constant to be used later
const weekKeys = getWeekKeys();
console.log(weekKeys); //logs the weekKeys array to see if correct

//WeekRange to display on the webpage
const weekRange = document.getElementById("week-range");
weekRange.textContent = `Week: ${weekKeys[0]} to ${weekKeys[6]}`; //this sets text content of weekRange element to show the date range of the week
console.log(weekRange.textContent); //logs the week range, to see if correct

//A function to create a new habit object
function newHabit(name) {
    return {
        id: Math.random().toString(36).slice(2, 9), //Generates a random string ID for the habit
        name: name, //based off the parameter name is name of the habit
        log: {} //log object to hold completion status
    };
}

//function to calculate how many consecutive days a habit was completed to show streak 
function computeStreak(habit) {
    let count = 0; //initialize count variable to hold streak count
    const d = new Date();
    //use while loop to check day from today and go backwards
    while (true) {
        const key = d.toISOString().split("T")[0]; //current date to key
        if (habit.log[key]) {
            count++; //if habit was completed on that day, increment count by 1
            d.setDate(d.getDate() - 1); //move to previous day  
        } else {
            break; //if habit was not completed, break the loop
        }
    }
    return count; //return the final streak count
}

/*------Require function to render page, every time it is called it will update the page based on current state------*/

function render() {

    rows.innerHTML = ""; //this will clear the rows of the HTML table to prepare for re-rendering

    //fill in motivational quote, randomly selected from array of quotes
    quoteSection.textContent = getRandomQuote();
    //if no habits exists, show a message
    if (state.habits.length === 0) {
        const row = document.createElement("div");//create a new placeholder row
        row.setAttribute("style", "display:grid;grid-template-columns:1.6fr repeat(7,.9fr) .8fr 1fr;align-items:center;border-bottom:1px solid #eef2f6;");

        //add comlumn habit name
        const nameCol = document.createElement("div");
        nameCol.setAttribute("style", "padding:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;");
        nameCol.textContent = "No habits yet."; //message to show when no habits
        row.appendChild(nameCol);//adds it to the row

        //adds empty columns for the week days
        weekKeys.forEach(() => {
            const col = document.createElement("div");
            col.setAttribute("style", "padding:10px;text-align:center;");
            row.appendChild(col);
        });

        //adds the streak coloumn (0 when empty)
        const streakCol = document.createElement("div");
        streakCol.setAttribute("style", "padding:10px;font-variant-numeric:tabular-nums;");
        streakCol.textContent = "0";//streak is 0 when no habits
        row.appendChild(streakCol);

        //actions column (empty when no habits)
        const actionsCol = document.createElement("div");
        actionsCol.setAttribute("style", "padding:10px;color:#66788a;");
        actionsCol.textContent = "Add a habit";//prompt to add a habit
        row.appendChild(actionsCol);

        //show the row on the page and return from function
        rows.appendChild(row);
        return;
    }
    //for each habit in state.habits, create a row in the table
    state.habits.forEach(h => {
        //creates habit row
        const row = document.createElement("div");
        row.setAttribute("style", "display:grid;grid-template-columns:1.6fr repeat(7,.9fr) .8fr 1fr;align-items:center;border-bottom:1px solid #eef2f6;");

        //add habit name
        const nameCol = document.createElement("div");
        nameCol.setAttribute("style", "padding:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;");
        nameCol.textContent = h.name;//sets text content to habit name
        row.appendChild(nameCol);//adds it to the row

        //add columns for each day of the week inside same forEach Loop  
        weekKeys.forEach(k => {
            const col = document.createElement("div");
            col.setAttribute("style", "padding:10px;text-align:center;");

            //create button toggle completion status each day
            const btn = document.createElement("button");
            btn.type = "button";
            btn.setAttribute("aria-label", `${h.name} on ${k}`); //accessibility label for screen readers
            btn.setAttribute("role", "checkbox"); //sets role to checkbox for accessibility

            //if habit was completed on that day, show checked state
            const checked = !!h.log[k]; //double negation to convert to boolean
            btn.setAttribute("aria-checked", String(checked)); //this sets aria-checked attribute for accessibility
            btn.textContent = checked ? "Yes" : ""; //the button text shows Yes if completed, empty if not

            //store habit ID and date key in dataset for later use in event listener
            btn.dataset.habitId = h.id;
            btn.dataset.dateKey = k;

            //style button based on completion status
            btn.setAttribute(
                "style",
                "display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin:auto;border-radius:8px;border:1px solid #dbe7f0;cursor:pointer;user-select:none;background:" + (checked ? "#e9f8ef" : "#fff") + ";color:" + (checked ? "#1e9e4a" : "inherit") + ";font-weight:" + (checked ? "700" : "400") + ";"
            );

            //need to add click event listener to toggle completion status
            btn.addEventListener("click", onToggleDay);

            //Space or enter presses should also toggle the button for accessibility
            btn.addEventListener("keydown", e => {
                if (e.key === " " || e.key === "Enter") {
                    e.preventDefault(); //will prevent default scrolling for space key
                    btn.click(); //to trigger a click event
                }
            });

            col.appendChild(btn); //this adds a button to the column
            row.appendChild(col); //this adds a column to the row
        });

        //add streak counter
        const streakCol = document.createElement("div");
        streakCol.setAttribute("style", "padding:10px;font-variant-numeric:tabular-nums;");
        streakCol.textContent = String(computeStreak(h)); //this sets text content to the computed streak for the habit
        row.appendChild(streakCol);

        //adding action buttons column
        const actions = document.createElement("div");
        actions.setAttribute("style", "padding:10px;display:flex;gap:8px;flex-wrap:wrap;");

        //tick button to mark habit as done today
        const tick = document.createElement("button");
        tick.type = "button";
        tick.textContent = "Tick Today";
        tick.setAttribute("style", "background:#fff;border:1px solid #dbe7f0;color:#0b3b58;padding:6px 10px;border-radius:8px;cursor:pointer;");
        tick.addEventListener("click", () => toggleLog(h.id, todayKey())); //on click, mark today as done
        actions.appendChild(tick); //add tick button to actions

        //adding delete button to remove habit
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute("style", "padding:6px 12px;border:none;background:#fee;color:#c00;border-radius:4px;cursor:pointer;font-weight:700;");
        deleteBtn.addEventListener("click", () => {
            if (confirm(`Delete " ${h.name}"? This action cannot be undone`)) {
                state.habits = state.habits.filter(x => x.id !== h.id); //this filters out the habit to be deleted
                saveState(state); //saves the updated state
                render(); //re-renders the page
            }
        });
        actions.appendChild(deleteBtn); //adds delete button to actions

        row.appendChild(actions); //this adds actions column to the row
        rows.appendChild(row); //this adds the completed row to the rows element

    });
}

/*------Event Handler and change state functions------*/

//toggle a habit's log for a specific day
function onToggleDay(e) {
    const btn = e.currentTarget; //this gets the button that was clicked
    const habitId = btn.dataset.habitId; //gets habit ID from dataset
    const dateKey = btn.dataset.dateKey; //gets date key from dataset
    toggleLog(habitId, dateKey); //calls toggleLog function to update state
}

//Add or remove a date from a habit's log
function toggleLog(habitId, dateKey) {
    const habit = state.habits.find(h => h.id === habitId);// this find the habit in state by ID
    if (habit) {
        habit.log[dateKey] = !habit.log[dateKey]; //this toggles the completion status for that date
        saveState(state); //this saves the updated state to localStorage
        render();//re-renders the page to reflect changes
    }
}

//add a habit thorugh the form on the page
document.getElementById("habit-form").addEventListener("submit", e => {
    e.preventDefault(); //prevents default form submission behavior
    const input = document.getElementById("habit-name");//gets the habit name input element
    const name = input.value.trim(); //gets the trimmed value of the input
    if (!name) return; //if name is empty, do nothing

    state.habits.push(newHabit(name)); //this adds a new habit to the state
    saveState(state); //saves the updated state
    input.value = ""; //clears the input field
    render();
});

/*------Manage all Data, with JSON files export, importing or deleting------*/

//export as JSON File
document.getElementById("export-json").addEventListener("click",() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });//this creates a blob from the state object
    const url = URL.createObjectURL(blob); //this creates a URL for the blob
    const a = document.createElement("a"); //this creates an anchor element
    a.href = url; //this sets the href to the blob URL
    a.download = "habits-export.json"; //this sets the download filename
    a.click(); //this triggers the download
    URL.revokeObjectURL(url); //this revokes the blob URL to free up memory
});

//import from JSON file
document.getElementById("import-json").addEventListener("change", async (e)=> {
    const file = e.target.files?.[0]; //this gets the selected file
    if (!file) return; //if no file selected, do nothing

    try {
        const test = await file.text(); //this reads the file content as text
        const data = JSON.parse(test); //this parses the text as JSON
        if (!Array.isArray(data.habits)) throw new Error("Invalid data format"); //this checks if the data format is valid
        
        state = data; //this sets the state to the imported data
        saveState(state); 
        render(); 
        alert ('Import successful!. Data has been loaded.'); //will show success alert
        } catch (err) {
        alert ("Failed to import data: Please verify the JSON file format"); //will show error alert if import fails
    }
    e.target.value = ""; //this will clear the file input
});

//reset all data
document.getElementById("reset-all").addEventListener("click", () => {
    if (!confirm("Delete all habit and log data?")) return; //this will end the function if user cancels

    state = { habits: [] }; //this resets the state to an empty habits array
    saveState(state); 
    render();
    alert("All data has been reset."); //this shows a confirmation alert
});

render(); //Initial render call to display the page based on current state