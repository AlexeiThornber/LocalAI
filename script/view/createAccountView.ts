/*
    This file will handle the view for the view for the createAccount.html page
*/
const createButtn = document.getElementById("submit"); 

if(createButtn){
    createButtn.addEventListener('click', async function(event){
        event.preventDefault();
        const username = (document.getElementById("username") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        const passwordHash = await hashPassword(password);

        const body = JSON.stringify({username, password: passwordHash})
        console.log(body);
                                        
        const response = await fetch('http://localhost:5000/api/create-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        console.log("Fetch completed");
        const text = await response.text();
        console.log("Raw response text:", text);
        let result;
        try {
            result = JSON.parse(text);
            console.log("Parsed JSON:", result);
        } catch (e) {
            console.error("JSON parse error:", e);
        }

        // try {
        //     const response = await fetch('http://localhost:5000/api/create-account', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: body
        //     });
        //     const result = await response.json();
        //     if (result.success) {
        //         console.log("We are here");
        //         window.location.href = "main.html";
        //     } else {
        //         alert(result.error || "Account creation failed.");
        //     }
        // } catch (err) {
        //     console.error("Error during fetch or JSON parsing:", err);
        //     alert("Server error or invalid response.");
        // }

        // const response = await fetch('http://localhost:5000/api/create-account', {
        //     method: 'POST',
        //     headers:{ 'Content-Type': 'application/json'},
        //     body: body
        // });

        // const result = await response.json();

        // if(result.success){
        //     console.log("We are here");
        //     console.log(response);
        //     window.location.href = "main.html";
        // }else{
        //     alert(result.error || "Account creation failed.");
        // }

    });
}else{
    console.log("Element with id 'createButtn' has not been found");
}

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    // Convert buffer to hex string
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}