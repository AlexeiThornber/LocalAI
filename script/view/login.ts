/*
    This file will handle the view for the login.html
*/

const createButton = document.getElementById("create");


if(createButton){
    createButton.addEventListener('click', function(){
        window.location.href = "createAccount.html";
    });
}else{
    console.log("Element with id 'createButton' has not been found");
}