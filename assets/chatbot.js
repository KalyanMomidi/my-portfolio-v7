/* ═══════════════════════════════════════════════════════════
   Portfolio Chatbot — calls Gemini API directly from browser
   ═══════════════════════════════════════════════════════════ */
(function () {
  const KEY  = window.GEMINI_KEY  || '';
  const DATA = window.PORTFOLIO_DATA || {};
  const NAME = DATA.name || 'this person';

  if (!KEY) return; // No key → chatbot hidden

  const SYSTEM = `You are a friendly portfolio assistant for ${NAME}. Help visitors learn about their background, skills, projects, and experience. Be warm, concise (2-4 sentences), and professional. Only answer questions related to the portfolio — if asked something else, politely redirect. Portfolio data: ${JSON.stringify(DATA)}`;

  const GREETING = `Hi! I'm ${NAME}'s AI assistant. Ask me anything about their skills, projects, or experience!`;

  /* ── Styles ─────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #cb-btn {
      position:fixed;bottom:24px;right:24px;z-index:9999;
      width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;
      background:linear-gradient(135deg,#7c3aed,#06b6d4);
      font-size:24px;display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 30px rgba(124,58,237,.6),0 4px 20px rgba(0,0,0,.4);
      transition:transform .2s;animation:cbPulse 2.5s ease-in-out infinite;
    }
    #cb-btn:hover{transform:scale(1.1);}
    @keyframes cbPulse{
      0%,100%{box-shadow:0 0 30px rgba(124,58,237,.6),0 4px 20px rgba(0,0,0,.4);}
      50%{box-shadow:0 0 55px rgba(124,58,237,.9),0 0 80px rgba(6,182,212,.3);}
    }
    #cb-panel {
      position:fixed;bottom:92px;right:24px;z-index:9999;
      width:340px;max-height:520px;border-radius:18px;overflow:hidden;
      background:rgba(13,13,31,.97);backdrop-filter:blur(20px);
      border:1px solid rgba(124,58,237,.35);
      box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(124,58,237,.2);
      display:flex;flex-direction:column;
      transition:opacity .25s,transform .25s;
    }
    #cb-panel.hidden{opacity:0;transform:translateY(12px) scale(.97);pointer-events:none;}
    #cb-header {
      padding:12px 16px;
      background:linear-gradient(135deg,#7c3aed,#06b6d4);
      display:flex;align-items:center;justify-content:space-between;
    }
    #cb-header-info{display:flex;align-items:center;gap:10px;}
    #cb-avatar {
      width:32px;height:32px;border-radius:50%;
      background:rgba(255,255,255,.2);display:flex;align-items:center;
      justify-content:center;font-weight:700;font-size:13px;color:#fff;
    }
    #cb-header h4{color:#fff;font-size:14px;font-weight:700;margin:0;}
    #cb-header p{color:rgba(255,255,255,.6);font-size:11px;margin:0;}
    #cb-close{background:none;border:none;color:rgba(255,255,255,.7);font-size:18px;cursor:pointer;line-height:1;transition:color .2s;}
    #cb-close:hover{color:#fff;}
    #cb-messages{
      flex:1;overflow-y:auto;padding:14px;display:flex;
      flex-direction:column;gap:10px;min-height:280px;max-height:340px;
    }
    #cb-messages::-webkit-scrollbar{width:4px;}
    #cb-messages::-webkit-scrollbar-thumb{background:rgba(124,58,237,.4);border-radius:4px;}
    .cb-msg{display:flex;max-width:85%;}
    .cb-msg.user{align-self:flex-end;}
    .cb-msg.bot {align-self:flex-start;}
    .cb-bubble{
      padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.6;
    }
    .cb-msg.user .cb-bubble{
      background:linear-gradient(135deg,#7c3aed,#4f46e5);
      color:#fff;border-bottom-right-radius:4px;
    }
    .cb-msg.bot .cb-bubble{
      background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);
      color:#e2e8f0;border-bottom-left-radius:4px;
    }
    .cb-typing span{
      display:inline-block;width:7px;height:7px;border-radius:50%;
      background:#818cf8;margin:0 2px;animation:cbDot .9s ease-in-out infinite;
    }
    .cb-typing span:nth-child(2){animation-delay:.2s;}
    .cb-typing span:nth-child(3){animation-delay:.4s;}
    @keyframes cbDot{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    #cb-input-row{
      padding:10px;display:flex;gap:8px;
      border-top:1px solid rgba(255,255,255,.07);
    }
    #cb-input{
      flex:1;padding:9px 13px;border-radius:12px;border:1px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.06);color:#e2e8f0;font-size:13px;
      outline:none;font-family:inherit;
    }
    #cb-input:focus{border-color:rgba(124,58,237,.5);background:rgba(124,58,237,.07);}
    #cb-input::placeholder{color:rgba(148,163,184,.5);font-style:italic;}
    #cb-send{
      padding:9px 14px;border-radius:12px;border:none;cursor:pointer;
      background:linear-gradient(135deg,#7c3aed,#06b6d4);
      color:#fff;font-size:14px;font-weight:700;transition:opacity .2s;
    }
    #cb-send:disabled{opacity:.4;cursor:default;}
    #cb-send:not(:disabled):hover{opacity:.85;}
    @media(max-width:420px){#cb-panel{width:calc(100vw - 32px);right:16px;} #cb-btn{right:16px;bottom:16px;}}
  `;
  document.head.appendChild(style);

  /* ── DOM ────────────────────────────────────────────────── */
  const btn = document.createElement('button');
  btn.id = 'cb-btn';
  btn.innerHTML = '💬';
  btn.setAttribute('aria-label', 'Open chat');

  const panel = document.createElement('div');
  panel.id = 'cb-panel';
  panel.classList.add('hidden');
  panel.innerHTML = `
    <div id="cb-header">
      <div id="cb-header-info">
        <div id="cb-avatar">AI</div>
        <div><h4>Portfolio Assistant</h4><p>Ask me anything</p></div>
      </div>
      <button id="cb-close">✕</button>
    </div>
    <div id="cb-messages"></div>
    <div id="cb-input-row">
      <input id="cb-input" placeholder="Ask about skills, projects..." autocomplete="off"/>
      <button id="cb-send">→</button>
    </div>`;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const msgs  = panel.querySelector('#cb-messages');
  const input = panel.querySelector('#cb-input');
  const send  = panel.querySelector('#cb-send');

  /* ── Helpers ────────────────────────────────────────────── */
  let history = [];

  function addMsg(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `cb-msg ${role}`;
    wrap.innerHTML = `<div class="cb-bubble">${text.replace(/\n/g,'<br>')}</div>`;
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return wrap;
  }

  function showTyping() {
    const w = document.createElement('div');
    w.className = 'cb-msg bot';
    w.id = 'cb-typing-indicator';
    w.innerHTML = `<div class="cb-bubble cb-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(w);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('cb-typing-indicator')?.remove();
  }

  async function callGemini(userText) {
    const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: userText }] }
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: { temperature: 0.75, maxOutputTokens: 512 }
        })
      }
    );
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || 'Sorry, I had trouble with that. Try asking something else!';
  }

  /* ── Events ─────────────────────────────────────────────── */
  btn.addEventListener('click', () => {
    const isOpen = !panel.classList.contains('hidden');
    panel.classList.toggle('hidden', isOpen);
    btn.innerHTML = isOpen ? '💬' : '✕';
    if (!isOpen) input.focus();
  });

  panel.querySelector('#cb-close').addEventListener('click', () => {
    panel.classList.add('hidden');
    btn.innerHTML = '💬';
  });

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    send.disabled = true;

    addMsg('user', text);
    showTyping();

    try {
      const reply = await callGemini(text);
      hideTyping();
      addMsg('bot', reply);
      history.push({ role: 'user', content: text });
      history.push({ role: 'model', content: reply });
      if (history.length > 20) history = history.slice(-20); // keep last 10 turns
    } catch {
      hideTyping();
      addMsg('bot', 'Connection error. Please try again.');
    } finally {
      send.disabled = false;
      input.focus();
    }
  }

  send.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

  /* ── Greeting ───────────────────────────────────────────── */
  addMsg('bot', GREETING);

})();
