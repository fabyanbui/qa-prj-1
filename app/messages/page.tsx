'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceMessage } from '@/types';

interface ThreadKey {
  key: string;
  withUserId: string;
  withUserName: string;
  requestId?: string;
}

export default function MessagesPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadKey | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  const loadMessages = async () => {
    if (!activeSession) return;

    const response = await fetch(`/api/messages?accountId=${encodeURIComponent(activeSession.user.id)}`);
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
      data?: MarketplaceMessage[];
    };

    if (!response.ok || !payload.success || !payload.data) {
      setError(payload.message ?? 'Failed to load messages');
      return;
    }

    setMessages(payload.data);
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!activeSession) {
      router.push('/login');
      return;
    }
    void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession, isReady, router]);

  const threads = useMemo(() => {
    if (!activeSession) return [];
    const map = new Map<string, ThreadKey>();

    messages.forEach((message) => {
      const isSender = message.senderId === activeSession.user.id;
      const counterpart = isSender ? message.receiver : message.sender;
      const key = `${counterpart.id}:${message.requestId ?? 'none'}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          withUserId: counterpart.id,
          withUserName: counterpart.profile.displayName,
          requestId: message.requestId ?? undefined,
        });
      }
    });

    return Array.from(map.values());
  }, [activeSession, messages]);

  useEffect(() => {
    if (!selectedThread && threads.length > 0) {
      setSelectedThread(threads[0]);
    }
  }, [selectedThread, threads]);

  const selectedMessages = useMemo(() => {
    if (!selectedThread || !activeSession) return [];
    return messages.filter((message) => {
      const matchesUser =
        (message.senderId === activeSession.user.id && message.receiverId === selectedThread.withUserId) ||
        (message.senderId === selectedThread.withUserId && message.receiverId === activeSession.user.id);
      const matchesRequest = (message.requestId ?? undefined) === selectedThread.requestId;
      return matchesUser && matchesRequest;
    });
  }, [activeSession, messages, selectedThread]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeSession || !selectedThread || !newMessage.trim()) return;

    setError('');
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: activeSession.user.id,
        receiverId: selectedThread.withUserId,
        requestId: selectedThread.requestId,
        content: newMessage.trim(),
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };

    if (!response.ok || !payload.success) {
      setError(payload.message ?? 'Failed to send message');
      return;
    }
    setNewMessage('');
    await loadMessages();
  };

  if (!isReady || !activeSession) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
      <p className="mt-1 text-gray-500">Manage your conversations with buyers and sellers.</p>

      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">Threads</h2>
          <div className="mt-3 space-y-2">
            {threads.length === 0 ? (
              <p className="text-sm text-gray-500">No conversations yet.</p>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.key}
                  onClick={() => setSelectedThread(thread)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    selectedThread?.key === thread.key
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-semibold">{thread.withUserName}</p>
                  <p className="text-xs">
                    {thread.requestId ? `Request: ${thread.requestId}` : 'General conversation'}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
          {!selectedThread ? (
            <p className="text-sm text-gray-500">Select a thread to view messages.</p>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-gray-800">
                Conversation with {selectedThread.withUserName}
              </h2>
              <div className="mt-3 max-h-[26rem] space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                {selectedMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages in this thread.</p>
                ) : (
                  selectedMessages.map((message) => {
                    const isOwn = message.senderId === activeSession.user.id;
                    return (
                      <div
                        key={message.id}
                        className={`rounded-md p-2 text-sm ${
                          isOwn ? 'ml-10 bg-amber-100 text-amber-900' : 'mr-10 bg-white text-gray-800'
                        }`}
                      >
                        <p className="text-xs font-semibold">
                          {message.sender.profile.displayName} ·{' '}
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                        <p className="mt-1">{message.content}</p>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={sendMessage} className="mt-3 flex gap-2">
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
