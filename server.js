// Dependencies
// =============================================================
const express = require("express");
const path = require("path");
const fs = require("fs");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//we had to set the static path of the assets directory so the server will find the css and js files
app.use(express.static(path.join(__dirname, 'assets')));

// Routes
// ==============================================================

// Home Route
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"))
})

// Notes Route
app.get("/notes", function (req, res) {
    res.sendFile(path.join(__dirname, "notes.html"))
})

// Notes Get Route for raw data dump
app.get("/api/notes", function(req, res) {
    return res.sendFile(path.join(__dirname, "/db/db.json"));
  });

// Notes Post Route
app.post("/api/notes", function (req, res) {
    
    //get the user note from notes.html
    var userNote = req.body;

    let existingNotes = [];
    let maxID;
    let newID;

    //open up the database file and read in the contents
    fs.readFile(path.join(__dirname, "db/db.json"), (err, data) => {
        if (err) throw err;

        //turn the data in the file into JSON so we can add the new note
        existingNotes = JSON.parse(data);

        //get the maxID so we can increment it
        if (existingNotes.length == 0 ){
            newID = 0;
        } else {
            maxID = existingNotes[existingNotes.length - 1].id;

             //make the newID a number
            newID = parseInt(maxID);

            //increment the ID
            newID++;
        }

        //set the id of the new note
        userNote.id = newID.toString();

        //Push the new note onto the array
        existingNotes.push(userNote);

        //write our file with the new data
        fs.writeFile(path.join(__dirname, "db/db.json"), JSON.stringify(existingNotes), function(err) {
            if (err) throw err;
        });
    });

    res.json(userNote);
});

// Notes Delete Route
app.delete("/api/notes/:id", function(req, res) {

    //get our noteID from the params so we know which one to delete
    let noteID = req.params.id;

    //get our file name
    let filePath = path.join(__dirname, "db/db.json");

    //open the db.json file so we can find the right entry to delete
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) throw err;

        //get the data into our variable
        let existingNotes = JSON.parse(data);

        //loop through the data so we can find the right note to delete
        for(i=0; i <= existingNotes.length; i++) {

            //check to see if we have a match
            if (existingNotes[i].id === noteID) {

                //remove the existing element from the array using splice
                existingNotes.splice(i, 1);

                break;
            }
        }
        //write our file and end the res to close out the delete
        fs.writeFile(path.join(__dirname, "db/db.json"), JSON.stringify(existingNotes), function(err) {
            if (err) throw err;
            return res.end();
        });
    });
});

//Start the server listening
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});