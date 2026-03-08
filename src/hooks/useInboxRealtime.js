import { useEffect } from "react";
import { createWsClient } from "../lib/ws.js";

function emitRetryQueueRefresh(detail = {}) {
  try {
    window.dispatchEvent(
      new CustomEvent("inbox:retry-queue-refresh", {
        detail,
      })
    );
  } catch {}
}

export function useInboxRealtime({
  selectedThread,
  setWsState,
  setThreads,
  setSelectedThread,
  setMessages,
  loadThreads,
  loadThreadDetail,
  loadRelatedLead,
  setRelatedLead,
}) {
  useEffect(() => {
    const client = createWsClient({
      onStatus: (status) => {
        setWsState(String(status?.state || "idle"));
      },
      onEvent: ({ type, payload }) => {
        if (!type) return;

        if (type === "inbox.thread.created" || type === "inbox.thread.updated") {
          const thread = payload?.thread;
          if (!thread?.id) return;

          setThreads((prev) => {
            const existing = prev.find((x) => x.id === thread.id);
            if (existing) {
              return prev.map((x) => (x.id === thread.id ? { ...x, ...thread } : x));
            }
            return [thread, ...prev];
          });

          setSelectedThread((prev) =>
            prev && prev.id === thread.id ? { ...prev, ...thread } : prev
          );

          return;
        }

        if (type === "inbox.thread.read") {
          const threadId = payload?.threadId;
          if (!threadId) return;

          setThreads((prev) =>
            prev.map((x) => (x.id === threadId ? { ...x, unread_count: 0 } : x))
          );

          setSelectedThread((prev) =>
            prev && prev.id === threadId ? { ...prev, unread_count: 0 } : prev
          );

          return;
        }

        if (type === "inbox.message.created") {
          const threadId = payload?.threadId;
          const message = payload?.message;
          if (!threadId || !message?.id) return;

          if (selectedThread?.id === threadId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === message.id)) return prev;
              return [...prev, message];
            });
          }

          loadThreads(selectedThread?.id || threadId);

          if (selectedThread?.id === threadId) {
            loadThreadDetail(threadId);
            loadRelatedLead(threadId);
          }

          return;
        }

        if (type === "inbox.message.updated") {
          const threadId = payload?.threadId || payload?.message?.thread_id;
          const message = payload?.message;
          if (!threadId || !message?.id) return;

          if (selectedThread?.id === threadId) {
            setMessages((prev) =>
              prev.map((m) => (m.id === message.id ? { ...m, ...message } : m))
            );
          }

          loadThreads(selectedThread?.id || threadId);

          if (selectedThread?.id === threadId) {
            loadThreadDetail(threadId);
          }

          emitRetryQueueRefresh({
            threadId,
            reason: "message_updated",
          });

          return;
        }

        if (
          type === "inbox.outbound.attempt.created" ||
          type === "inbox.outbound.attempt.updated"
        ) {
          const attempt = payload?.attempt;
          const threadId = attempt?.thread_id || "";
          if (!attempt?.id) return;

          if (threadId) {
            loadThreads(selectedThread?.id || threadId);

            if (selectedThread?.id === threadId) {
              loadThreadDetail(threadId);
            }
          }

          emitRetryQueueRefresh({
            threadId,
            attemptId: attempt.id,
            status: attempt.status || "",
            reason:
              type === "inbox.outbound.attempt.created"
                ? "attempt_created"
                : "attempt_updated",
          });

          return;
        }

        if (type === "lead.created" || type === "lead.updated") {
          const lead = payload?.lead;
          if (!lead?.id) return;

          if (String(lead?.inbox_thread_id || "") === String(selectedThread?.id || "")) {
            setRelatedLead(lead);
          }
        }
      },
    });

    if (client.canUseWs()) {
      client.start();
    } else {
      setWsState("off");
    }

    return () => {
      try {
        client.stop();
      } catch {}
    };
  }, [
    selectedThread,
    setWsState,
    setThreads,
    setSelectedThread,
    setMessages,
    loadThreads,
    loadThreadDetail,
    loadRelatedLead,
    setRelatedLead,
  ]);
}