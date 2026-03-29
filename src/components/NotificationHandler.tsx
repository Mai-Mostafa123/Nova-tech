import React, { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'sonner';

export default function NotificationHandler() {
  const { messages } = useWebSocket('ws://localhost:24679'); // WebSocket port

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      toast.info(`Notification: ${latestMessage}`);
    }
  }, [messages]);

  return null; // This component doesn't render anything
}