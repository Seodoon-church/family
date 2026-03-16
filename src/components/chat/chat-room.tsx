"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronUp } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

interface ChatRoomProps {
  familyId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string;
}

/** 날짜 구분 라벨 (오늘, 어제, 또는 YYYY년 M월 D일) */
function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = today.getTime() - target.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getDateKey(msg: ChatMessage): string {
  const d = msg.createdAt?.toDate ? msg.createdAt.toDate() : null;
  if (!d) return "";
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function ChatRoom({
  familyId,
  currentUserId,
  currentUserName,
  currentUserImage,
}: ChatRoomProps) {
  const { messages, loading, hasMore, sendMessage, loadMore } = useChat(familyId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const prevMsgCountRef = useRef(0);

  // 새 메시지가 오면 하단으로 스크롤
  useEffect(() => {
    if (autoScroll && messages.length > prevMsgCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: messages.length - prevMsgCountRef.current > 5 ? "auto" : "smooth" });
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length, autoScroll]);

  // 초기 로딩 시 하단으로
  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
    }
  }, [loading]);

  // 스크롤 위치 감지 → 자동스크롤 on/off
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight || 0;
    await loadMore();
    // 스크롤 위치 유지
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - prevHeight;
      });
    }
    setLoadingMore(false);
  };

  const handleSend = (text: string) => {
    sendMessage(text, currentUserId, currentUserName, currentUserImage);
    setAutoScroll(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner text="대화를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}>
      {/* 메시지 영역 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 paper-texture"
      >
        {/* 이전 메시지 불러오기 */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-1 text-xs text-muted hover:text-foreground px-3 py-1.5 rounded-full bg-warm-hover transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              {loadingMore ? "불러오는 중..." : "이전 대화 보기"}
            </button>
          </div>
        )}

        {/* 빈 상태 */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p
              className="text-lg text-foreground/50 mb-2"
              style={{ fontFamily: "var(--font-story)" }}
            >
              아직 대화가 없습니다
            </p>
            <p className="text-sm text-muted">
              가족에게 첫 인사를 건네보세요!
            </p>
          </div>
        )}

        {/* 메시지 목록 */}
        {messages.map((msg, i) => {
          const prevMsg = i > 0 ? messages[i - 1] : null;
          const isOwn = msg.senderId === currentUserId;

          // 날짜 구분선
          const currentDateKey = getDateKey(msg);
          const prevDateKey = prevMsg ? getDateKey(prevMsg) : "";
          const showDateDivider = currentDateKey !== prevDateKey;

          // 같은 사람이 연속으로 보냈으면 아바타/이름 숨김
          const sameSenderAsPrev = prevMsg?.senderId === msg.senderId && !showDateDivider;

          return (
            <div key={msg.id}>
              {showDateDivider && currentDateKey && (
                <div className="flex items-center justify-center my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="date-stamp text-[11px] px-3">{getDateLabel(msg.createdAt?.toDate?.() || new Date())}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <MessageBubble
                message={msg}
                isOwn={isOwn}
                showAvatar={!isOwn && !sameSenderAsPrev}
                showName={!isOwn && !sameSenderAsPrev}
              />
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* 입력바 */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
