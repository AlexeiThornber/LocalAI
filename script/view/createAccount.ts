import {hashPassword} from '../helper.js';
import {sendPayload} from '../controller/dbAPI.js'

/*
    This file will handle the view for the view for the createAccount.html page
*/
const createButtn = document.getElementById("createButtn"); 
const createAccount = document.getElementById("createAccount");

if(createButtn){
    createButtn.addEventListener('click', async function(){

        const username = (document.getElementById("username") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        const passwordHash = await hashPassword(password);

        sendPayload(username, passwordHash, "create-account");
    });
}else{
    console.log("Element with id 'createButtn' has not been found");
}

if(createAccount){
    createAccount.addEventListener('keydown', async function(event){
        if(event.key == "Enter"){
            const username = (document.getElementById("username") as HTMLInputElement).value;
            const password = (document.getElementById("password") as HTMLInputElement).value;

            const passwordHash = await hashPassword(password);

            sendPayload(username, passwordHash, "create-account");
        }
    });
}else{
    console.log("Element with id 'createAccount' has not been found");
}