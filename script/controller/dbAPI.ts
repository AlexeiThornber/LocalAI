

export async function sendPayload(
    username: string,
    passwordHash: string,
    type: string, //Type can be login or create-account
    ){
    const response = await fetch(`http://localhost:5000/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: username, password: passwordHash})
    });
        
    const text = await response.text(); 
    console.log("Raw response text:", text);

    let result: { success: any; error: any; };

    try {
        result = JSON.parse(text);
        console.log("Parsed JSON:", result);
    } catch (e) {
        console.error("JSON parse error:", e);
    }

    if(result.success){
        sessionStorage.setItem('username', username);
        window.location.href = `main.html`
    }else{
        alert(`Error: ${result.error}`);   
    }
}