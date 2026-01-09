import {login} from '../controller/dbAPI.js';
// import {hashPassword} from '../helper.js';
/*
    This file will handle the view for the login.html
*/
const loginButton = document.getElementById("loginButton");
const loginForm = document.getElementById("loginForm");
const createButton = document.getElementById("createButton");

if(loginButton){
    loginButton.addEventListener('click', async function(){
        getAndSendCredentials();
    });
}else{
    console.log("Element with id 'loginButton' has not been found"); 
}

if(loginForm){
    loginForm.addEventListener('keydown', async function(event){
        if(event.key == "Enter"){
            getAndSendCredentials();
        }
    });
}else{
    console.log("Element with id 'loginForm' has not been found");
}

if(createButton){
    createButton.addEventListener('click', function(){
        window.location.href = "/html/createAccount.html";
    });
}else{
    console.log("Element with id 'createButton' has not been found");
}

async function getAndSendCredentials(){
    const username = (document.getElementById("username") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

    // const passwordHash = await hashPassword(password);

    login(username, password, "login");
}