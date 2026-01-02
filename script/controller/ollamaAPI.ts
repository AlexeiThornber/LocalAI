/*
    This file handles the request between the client and the ollama API.
    It will receive the text inputted by the user as arguements
    and send and http request to the running instance of ollama.
    It will then parse the request and send it back to the UI.ts file as a response.
*/
export async function sendPayload(
    payload: string,
    model: string,
    onStream: (text:string) => void 
):Promise<void>{
    // Prepare request data
    const requestData = {
        model: 'Mistral', //TODO add the model parameter here
        prompt: payload,
        stream: true
    };

    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    });

    parsePayload(response, onStream)
}

export async function getTitle(
    payload: string,
    model: string,
    callback: (title: string) => void
):Promise<void>{
    const requestData ={
        model: 'Mistral', //TODO add the model parameter here
        prompt: "Create a title of at most 5 words: " + payload,
        stream: false
    };

    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    });

    const reply = await response.text();
    const result = JSON.parse(reply);
    callback(result.response.slice(1).replace(/^"+|"+$/g, ''));
}

async function parsePayload(
    response: Response,
    onStream: (text:string) => void
):Promise<void> {
    if(!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while(true){
        const {value, done} = await reader.read();
        if (done) {
            break;
        }
        buffer += decoder.decode(value, {stream: true});

        let lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for( const line  of lines){
            if(line.trim() === '') continue;
            try{
                const data = JSON.parse(line);
                if(data.response){
                    onStream(data.response);
                }
            }catch(e){
                //Ignore parse errors for incomplete lines
            }
        }
    }
}
