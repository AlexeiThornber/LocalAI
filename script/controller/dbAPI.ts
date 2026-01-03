
export async function login(
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
        window.location.href = `main.html`;
    }else{
        alert(`Error: ${result.error}`);   
    }
}

export async function saveMessages(uid: string, chatId: string,  messages: NodeList){
    const conversationHistory: Array<{user:string, bot:string}> = [];

    for(let i = 0; i < messages.length; i += 2){
        const userMsg = messages[i]?.textContent || "";
        const botMsg = messages[i + 1]?.textContent || "";
        conversationHistory.push({
            user: userMsg,
            bot: botMsg
        });
    }

    const payload = {
        username: uid,
        chatID: chatId,
        history: conversationHistory
    }

    console.log(payload);

    const response = await fetch(`http://localhost:5000/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}