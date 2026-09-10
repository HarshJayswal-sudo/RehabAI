import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, CheckCircle2, MessageCircle, Send, Sparkles, X } from 'lucide-react';

const QUICK_PROMPTS = [
  'How should I prepare for a session?',
  'Show me a gentle exercise',
  'Why is form accuracy important?'
];

const getReply = (message) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('prepare') || normalized.includes('session')) {
    return 'Before you begin, clear a little space, place your camera so your full body is visible, and wear comfortable clothing. We will calibrate your pose before the first repetition.';
  }

  if (normalized.includes('gentle') || normalized.includes('exercise')) {
    return 'Try the seated leg extension for a controlled, low-impact movement. Open the exercise library to review the setup and launch a guided session when you are ready.';
  }

  if (normalized.includes('form') || normalized.includes('accuracy')) {
    return 'Form accuracy reflects how closely your movement matches the target pattern. Improving it helps you build control and make each repetition more useful.';
  }

  if (normalized.includes('doctor') || normalized.includes('therap')) {
    return 'You can connect with a physiotherapist from the Doctor Portal. Your approved clinician can review your recovery metrics and session history.';
  }

  return 'I can help with exercise setup, form accuracy, session preparation, and connecting with a physiotherapist. What would you like to work on?';
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hi, I am your PhysioAssist guide. How can I help with your recovery today?'
    }
  ]);

  const sendMessage = (value = message) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: 'user', text: trimmed },
      { id: Date.now() + 1, sender: 'assistant', text: getReply(trimmed) }
    ]);
    setMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="chat-widget">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            className="chat-panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            aria-label="PhysioAssist chat"
          >
            <header className="chat-panel-header">
              <div className="chat-agent-mark"><Bot size={19} /></div>
              <div>
                <div className="chat-panel-title">Recovery guide</div>
                <div className="chat-panel-status"><span /> Available now</div>
              </div>
              <button className="chat-close-button" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <X size={18} />
              </button>
            </header>

            <div className="chat-messages" aria-live="polite">
              <div className="chat-welcome-note"><Sparkles size={14} /> AI guidance for your rehabilitation journey</div>
              {messages.map((item) => (
                <div key={item.id} className={`chat-message-row ${item.sender === 'user' ? 'is-user' : ''}`}>
                  {item.sender === 'assistant' && <div className="chat-mini-avatar"><Bot size={14} /></div>}
                  <div className="chat-bubble">{item.text}</div>
                </div>
              ))}
            </div>

            <div className="chat-quick-prompts">
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}</button>
              ))}
            </div>

            <form className="chat-composer" onSubmit={handleSubmit}>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about your recovery..."
                aria-label="Message recovery guide"
              />
              <button type="submit" aria-label="Send message" disabled={!message.trim()}>
                <Send size={16} />
              </button>
            </form>
            <div className="chat-disclaimer"><CheckCircle2 size={12} /> General guidance only, not medical advice</div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        className={`chat-launcher ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((current) => !current)}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.96 }}
        aria-label={isOpen ? 'Close recovery chat' : 'Open recovery chat'}
      >
        {isOpen ? <X size={23} /> : <MessageCircle size={23} />}
        {!isOpen && <span className="chat-launcher-label">Need help?</span>}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
