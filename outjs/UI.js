"use strict";
/*
This javascript file will handle the UI.
This includes
- Changing the content of the website
- Changing the apperance of website
*/
Object.defineProperty(exports, "__esModule", { value: true });
const userInput = document.getElementById('userInput');
if (userInput) {
    userInput.addEventListener('keydown', function (event) {
        if (event.key == "Enter") {
            console.log(userInput.value);
        }
    });
}
else {
    console.log("Element with id 'userInput' has not been found");
}
//caca900
