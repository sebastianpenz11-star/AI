<script>
(function() {
    // Create and inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-container.position-left { right: auto; left: 20px; }
        .n8n-chat-widget .chat-container.open { display: flex; flex-direction: column; }

        .n8n-chat-widget .brand-header {
            padding: 16px; display: flex; align-items: center; gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1); position: relative;
        }
        .n8n-chat-widget .close-button {
            position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
            background: none; border: none; color: var(--chat--color-font); cursor: pointer;
            padding: 4px; display: flex; align-items: center; justify-content: center;
            transition: opacity 0.2s; font-size: 28px; opacity: 0.6;
        }
        .n8n-chat-widget .close-button:hover { opacity: 1; }
        .n8n-chat-widget .brand-header img { width: 32px; height: 32px; }
        .n8n-chat-widget .brand-header span { font-size: 18px; font-weight: 500; color: var(--chat--color-font); }

        .n8n-chat-widget .new-conversation {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            padding: 20px; text-align: center; width: 100%; max-width: 300px;
        }
        .n8n-chat-widget .welcome-text {
            font-size: 24px; font-weight: 600; color: var(--chat--color-font);
            margin-bottom: 24px; line-height: 1.3;
        }

        /* Buttons (mit Denk-/Loading-State) */
        .n8n-chat-widget .new-chat-btn,
        .n8n-chat-widget .chat-input button {
            display: inline-flex; align-items: center; justify-content: center; gap: 10px;
            padding: 12px 20px; background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: transform 0.2s;
            font-family: inherit; font-weight: 500; position: relative; user-select: none;
        }
        .n8n-chat-widget .new-chat-btn:hover,
        .n8n-chat-widget .chat-input button:hover { transform: scale(1.05); }

        /* Denk-/Loading-State: Spinner + Texttausch */
        .n8n-chat-widget .btn-label { display: inline-flex; align-items: center; gap: 8px; }
        .n8n-chat-widget .spinner {
            width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.6);
            border-right-color: transparent; border-radius: 50%; display: none;
            animation: n8n-spin 0.8s linear infinite;
        }
        .n8n-chat-widget .is-loading .spinner { display: inline-block; }
        .n8n-chat-widget .is-loading .btn-label { opacity: 0.0; }
        .n8n-chat-widget .is-loading { pointer-events: none; }

        @keyframes n8n-spin { to { transform: rotate(360deg); } }

        .n8n-chat-widget .message-icon { width: 20px; height: 20px; }
        .n8n-chat-widget .response-text { font-size: 14px; color: var(--chat--color-font); opacity: 0.7; margin: 0; }

        .n8n-chat-widget .chat-interface { display: none; flex-direction: column; height: 100%; }
        .n8n-chat-widget .chat-interface.active { display: flex; }

        .n8n-chat-widget .chat-messages {
            flex: 1; overflow-y: auto; padding: 20px; background: var(--chat--color-background);
            display: flex; flex-direction: column;
        }
        .n8n-chat-widget .chat-message {
            padding: 12px 16px; margin: 8px 0; border-radius: 12px; max-width: 80%;
            word-wrap: break-word; font-size: 14px; line-height: 1.5;
        }
        .n8n-chat-widget .chat-message.user {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white; align-self: flex-end; box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2); border: none;
        }
        .n8n-chat-widget .chat-message.bot {
            background: var(--chat--color-background); border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font); align-self: flex-start; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        /* Tipp-/Denk-Indikator in der Chat-History (drei Punkte) */
        .n8n-chat-widget .chat-message.typing { display: inline-flex; gap: 6px; align-items: center; }
        .n8n-chat-widget .dot {
            width: 6px; height: 6px; border-radius: 50%; background: var(--chat--color-font);
            opacity: 0.4; animation: n8n-bounce 1.2s infinite ease-in-out;
        }
        .n8n-chat-widget .dot:nth-child(2) { animation-delay: 0.15s; }
        .n8n-chat-widget .dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes n8n-bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-4px); opacity: 1; }
        }

        .n8n-chat-widget .chat-input {
            padding: 16px; background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1); display: flex; gap: 8px;
        }
        .n8n-chat-widget .chat-input textarea {
            flex: 1; padding: 12px; border: 1px solid rgba(133, 79, 255, 0.2); border-radius: 8px;
            background: var(--chat--color-background); color: var(--chat--color-font);
            resize: none; font-family: inherit; font-size: 14px;
        }
        .n8n-chat-widget .chat-input textarea::placeholder { color: var(--chat--color-font); opacity: 0.6; }

        .n8n-chat-widget .chat-toggle {
            position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 30px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999; transition: transform 0.3s; display: flex; align-items: center; justify-content: center;
        }
        .n8n-chat-widget .chat-toggle.position-left { right: auto; left: 20px; }
        .n8n-chat-widget .chat-toggle:hover { transform: scale(1.05); }
        .n8n-chat-widget .chat-toggle svg { width: 24px; height: 24px; fill: currentColor; }

        .n8n-chat-widget .chat-footer {
            padding: 8px; text-align: center; background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }
        .n8n-chat-widget .chat-footer a {
            color: var(--chat--color-primary); text-decoration: none; font-size: 12px; opacity: 0.8; transition: opacity 0.2s; font-family: inherit;
        }
        .n8n-chat-widget .chat-footer a:hover { opacity: 1; }
    `;

    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Default configuration
    const defaultConfig = {
        webhook: { url: '', route: '' },
        branding: { logo: '', name: '', welcomeText: '', responseTimeText: '' },
        style: { primaryColor: '', secondaryColor: '', position: 'right', backgroundColor: '#ffffff', fontColor: '#333333' }
    };

    // Merge user config with defaults
    const config = window.ChatWidgetConfig ?
        { webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
          branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
          style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style } }
        : defaultConfig;

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';

    // Set CSS variables
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

    const newConversationHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button" aria-label="Chat schließen">×</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn" type="button">
                <span class="btn-label">
                  <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
                  Sende uns eine Nachricht
                </span>
                <span class="spinner" aria-hidden="true"></span>
            </button>
            <p class="response-text">${config.branding.responseTimeText}</p>
        </div>
    `;

    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="close-button" aria-label="Chat schließen">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Gib hier deine Nachricht ein..." rows="1"></textarea>
                <button type="submit">
                  <span class="btn-label">Senden</span>
                  <span class="spinner" aria-hidden="true"></span>
                </button>
            </div>
        </div>
    `;

    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;

    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.setAttribute('aria-label', 'Chat öffnen');
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`;

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');

    function generateUUID() { return crypto.randomUUID(); }

    // Helfer: Button in Denk-/Loading-Status setzen
    function setButtonThinking(btn, thinking = true, ariaText = 'Denkt …') {
        if (!btn) return;
        if (thinking) {
            btn.classList.add('is-loading');
            btn.setAttribute('aria-busy', 'true');
            btn.setAttribute('aria-live', 'polite');
            btn.setAttribute('data-prev-label', btn.querySelector('.btn-label')?.textContent || '');
            // Optional: Sichtbarer Textwechsel (wenn du willst)
            // btn.querySelector('.btn-label').textContent = ariaText;
        } else {
            btn.classList.remove('is-loading');
            btn.removeAttribute('aria-busy');
            btn.removeAttribute('aria-live');
            const prev = btn.getAttribute('data-prev-label');
            if (prev && btn.querySelector('.btn-label')) btn.querySelector('.btn-label').textContent = prev;
            btn.removeAttribute('data-prev-label');
        }
    }

    // Helfer: Tipp-/Denk-Indikator in der Chat-History
    function addTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'chat-message bot typing';
        typing.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
        messagesContainer.appendChild(typing);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typing;
    }

    async function startNewConversation() {
        currentSessionId = generateUUID();
        const data = [{
            action: "loadPreviousSession",
            sessionId: currentSessionId,
            route: config.webhook.route,
            metadata: { userId: "" }
        }];

        setButtonThinking(newChatBtn, true, 'Lädt …');
        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const responseData = await response.json();

            chatContainer.querySelector('.brand-header').style.display = 'none';
            chatContainer.querySelector('.new-conversation').style.display = 'none';
            chatInterface.classList.add('active');

            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            const raw = Array.isArray(responseData) ? responseData[0].output : responseData.output;
            botMessageDiv.innerHTML = raw;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setButtonThinking(newChatBtn, false);
        }
    }

    async function sendMessage(message) {
        const messageData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: message,
            metadata: { userId: "" }
        };

        // User-Blase
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // UI: Button -> Denken + Tipp-Indikator
        setButtonThinking(sendButton, true, 'Denkt …');
        const typingIndicator = addTypingIndicator();

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
            const data = await response.json();

            // Tipp-Indikator entfernen
            typingIndicator.remove();

            // Bot-Antwort (HTML erlaubt)
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            const raw = Array.isArray(data) ? data[0].output : data.output;
            botMessageDiv.innerHTML = raw;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
            // Tipp-Indikator bei Fehler weg
            typingIndicator.remove();
            const errDiv = document.createElement('div');
            errDiv.className = 'chat-message bot';
            errDiv.textContent = 'Ups, da ist etwas schiefgelaufen. Bitte versuch es noch einmal.';
            messagesContainer.appendChild(errDiv);
        } finally {
            setButtonThinking(sendButton, false);
        }
    }

    // Events
    newChatBtn.addEventListener('click', startNewConversation);

    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = '';
        }
    });

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                textarea.value = '';
            }
        }
    });

    const toggleButtonClick = () => chatContainer.classList.toggle('open');
    toggleButton.addEventListener('click', toggleButtonClick);

    // Close Buttons
    chatContainer.querySelectorAll('.close-button').forEach(btn => {
        btn.addEventListener('click', () => chatContainer.classList.remove('open'));
    });
})();
</script>