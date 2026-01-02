import {sendPayload} from '../controller/dbAPI.js';
import {hashPassword} from '../helper.js';
/*
    This file will handle the view for the login.html
*/
const loginButton = document.getElementById("loginButton");
const createButton = document.getElementById("createButton");

if(loginButton){
    loginButton.addEventListener('click', async function(){
        const username = (document.getElementById("username") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        const passwordHash = await hashPassword(password);

        sendPayload(username, passwordHash, "login");
    });
}else{
    console.log("Element with id 'loginButton' has not been found"); 
}

if(createButton){
    createButton.addEventListener('click', function(){
        window.location.href = "createAccount.html";
    });
}else{
    console.log("Element with id 'createButton' has not been found");
}