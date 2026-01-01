export const config = {
    runtime: 'edge', // Enable Edge Runtime for streaming
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const body = await req.json();
        const { targetUrl, model, prompt, stream } = body;

        if (!targetUrl) {
            return new Response('Missing targetUrl', { status: 400 });
        }

        // Construct the full destination URL
        const destination = `${targetUrl}/api/generate`;

        // Forward the request to Ngrok/Ollama
        const response = await fetch(destination, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // This is the magic header to bypass Ngrok warning
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: stream
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(`Upstream Error: ${response.status} - ${errorText}`, { status: response.status });
        }

        // Return the response stream directly to the client
        return new Response(response.body, {
            headers: {
                'Content-Type': 'application/json',
                // Optional: add CORS if needed for accessing from other domains
                // 'Access-Control-Allow-Origin': '*' 
            }
        });

    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 500 });
    }
}
