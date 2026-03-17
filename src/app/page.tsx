"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { GoldCorners } from "@/components/book/gold-corners";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { FeatureCard } from "@/components/landing/feature-card";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import {
  BookOpenSvg,
  FamilyTreeSvg,
  QuillPenSvg,
  PolaroidStackSvg,
  ChatBubblesSvg,
  DiaryBookSvg,
  TimelineSvg,
} from "@/components/landing/landing-svg-illustrations";
import { ArrowRight, ChevronDown } from "lucide-react";

const features = [
  {
    icon: <FamilyTreeSvg className="w-full h-full" />,
    title: "가계도",
    subtitle: "뿌리를 한눈에",
    description:
      "가족의 뿌리를 시각적으로 탐색하세요. 사진, 이름, 관계를 한눈에 볼 수 있습니다.",
  },
  {
    icon: <QuillPenSvg className="w-full h-full" />,
    title: "이야기",
    subtitle: "소중한 순간을 기록",
    description:
      "할머니의 레시피부터 아이의 첫 말까지, 리치 텍스트로 아름답게 기록하세요.",
  },
  {
    icon: <PolaroidStackSvg className="w-full h-full" />,
    title: "사진첩",
    subtitle: "추억을 모아",
    description:
      "가족 사진과 영상을 안전하게 보관하고 앨범으로 정리하세요.",
  },
  {
    icon: <ChatBubblesSvg className="w-full h-full" />,
    title: "가족 톡방",
    subtitle: "언제나 가까이",
    description:
      "가족 전용 대화방에서 일상을 나누세요. 푸시 알림으로 놓치지 않아요.",
  },
  {
    icon: <DiaryBookSvg className="w-full h-full" />,
    title: "연감 PDF",
    subtitle: "한 해를 한 권으로",
    description:
      "1년간의 이야기, 사진, 기념일을 자동으로 모아 아름다운 PDF 연감을 만들어요.",
  },
  {
    icon: <TimelineSvg className="w-full h-full" />,
    title: "연대기",
    subtitle: "시간의 흐름을 따라",
    description:
      "결혼, 탄생, 졸업... 가족의 중요한 순간을 시간 순으로 정리하세요.",
  },
];

const steps = [
  { number: 1, title: "가입하기", desc: "이메일 또는 Google로 간단하게 가입하세요" },
  { number: 2, title: "가족 만들기", desc: "초대 코드로 가족을 모으세요" },
  { number: 3, title: "이야기 기록", desc: "추억을 한 권의 책으로 엮어가세요" },
];

const faqs = [
  {
    q: "정말 무료인가요?",
    a: "네, 완전히 무료입니다. 가족 이야기 기록, 가계도, 사진첩, 톡방 등 모든 핵심 기능을 무료로 이용할 수 있습니다.",
  },
  {
    q: "가족은 몇 명까지 등록할 수 있나요?",
    a: "인원 제한 없이 자유롭게 등록할 수 있습니다. 직계 가족뿐 아니라 친척까지 모두 포함할 수 있어요.",
  },
  {
    q: "데이터는 안전한가요?",
    a: "Google Firebase 인프라를 사용하여 데이터를 안전하게 보관합니다. 가족 데이터는 초대 코드로 접근 제한됩니다.",
  },
  {
    q: "다른 가족도 사용할 수 있나요?",
    a: "물론이죠! 각 가족별로 독립된 공간이 만들어집니다. 여러 가족이 자유롭게 사용할 수 있어요.",
  },
  {
    q: "연감 PDF는 어떻게 만드나요?",
    a: "1년간 기록한 이야기, 사진, 기념일을 자동으로 모아 아름다운 PDF 연감을 생성해줍니다. 클릭 한 번이면 완성!",
  },
  {
    q: "모바일에서도 잘 되나요?",
    a: "네, 모바일 브라우저에서 최적화되어 작동합니다. 언제 어디서든 가족 이야기를 기록하고 공유할 수 있어요.",
  },
];

export default function LandingPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // 인증된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      if (userProfile?.familyId) {
        router.push("/dashboard");
      } else {
        router.push("/setup");
      }
    }
  }, [loading, user, userProfile, router]);

  // IntersectionObserver로 스크롤 리빌 애니메이션
  useEffect(() => {
    const elements = document.querySelectorAll(".landing-scroll-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* ===== A. Hero Section ===== */}
      <section className="min-h-screen linen-texture flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="relative landing-book-cover rounded-2xl w-full max-w-2xl p-10 md:p-16 landing-scale-in">
          <GoldCorners size={40} className="absolute inset-0 pointer-events-none" />

          <div className="flex flex-col items-center text-center">
            {/* 열린 책 배경 SVG */}
            <BookOpenSvg className="w-48 md:w-64 text-primary/80 mb-2" />

            {/* 도장 로고 */}
            <div className="stamp-seal w-20 h-20 bg-primary/10 flex items-center justify-center mb-6">
              <span
                className="text-primary font-bold text-3xl"
                style={{ fontFamily: "var(--font-story)" }}
              >
                家
              </span>
            </div>

            {/* 제목 */}
            <h1
              className="text-4xl md:text-5xl text-foreground font-semibold leading-snug mb-4 landing-fade-up"
              style={{ fontFamily: "var(--font-story)" }}
            >
              우리家 이야기
            </h1>

            <div className="warm-divider w-28 mb-6 landing-fade-up-delay-1" />

            {/* 감성 문구 */}
            <p
              className="text-foreground/70 text-base md:text-lg leading-relaxed mb-2 max-w-md landing-fade-up-delay-1"
              style={{ fontFamily: "var(--font-story)" }}
            >
              우리의 하루 일상으로<br />
              우리 가족의 스토리북을 만들어보세요.
            </p>
            <p
              className="text-foreground/50 italic text-sm md:text-base mb-8 max-w-md landing-fade-up-delay-2"
              style={{ fontFamily: "var(--font-story)" }}
            >
              할머니의 레시피, 아버지의 젊은 시절, 아이의 첫 걸음마...<br />
              흩어지기 전에, 한 권의 이야기로 엮어보세요.
            </p>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row items-center gap-3 landing-fade-up-delay-3">
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-medium text-base hover:bg-primary-dark transition-colors warm-shadow"
              >
                무료로 시작하기
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3 border border-border text-foreground/70 rounded-lg font-medium text-base hover:bg-warm-hover transition-colors"
              >
                기능 살펴보기
              </a>
            </div>
            <a
              href="/login"
              className="text-sm text-muted hover:text-primary transition-colors mt-4 landing-fade-up-delay-3"
            >
              이미 계정이 있으신가요? <span className="underline">로그인</span>
            </a>
          </div>
        </div>

        {/* 스크롤 안내 */}
        <div className="mt-12 text-primary/40 animate-bounce">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </section>

      {/* ===== B. Features Section ===== */}
      <section id="features" className="py-20 px-4 md:px-8 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 landing-scroll-reveal">
            <h2
              className="text-2xl md:text-3xl text-foreground font-semibold mb-3"
              style={{ fontFamily: "var(--font-story)" }}
            >
              가족을 위한 모든 것
            </h2>
            <p className="text-foreground/60 text-base max-w-md mx-auto">
              한 권의 가족 책을 완성해가는 데 필요한 도구들을 모았습니다.
            </p>
            <OrnamentDivider className="w-48 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="landing-scroll-reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== C. How It Works Section ===== */}
      <section id="how-it-works" className="py-20 px-4 md:px-8 bg-card/50 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14 landing-scroll-reveal">
            <h2
              className="text-2xl md:text-3xl text-foreground font-semibold mb-3"
              style={{ fontFamily: "var(--font-story)" }}
            >
              간단한 3단계
            </h2>
            <p className="text-foreground/60 text-base">
              시작은 쉽고, 기록은 영원합니다.
            </p>
            <OrnamentDivider className="w-48 mx-auto mt-6" />
          </div>

          {/* 데스크톱: 가로 배치 */}
          <div className="hidden md:flex items-start justify-center gap-0 landing-scroll-reveal">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-start">
                <div className="flex flex-col items-center text-center w-48">
                  <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mb-4 bg-card">
                    <span
                      className="text-2xl text-primary font-semibold"
                      style={{ fontFamily: "var(--font-story)" }}
                    >
                      {step.number}
                    </span>
                  </div>
                  <h3
                    className="text-lg font-semibold text-foreground mb-2"
                    style={{ fontFamily: "var(--font-story)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="step-connector flex-1 min-w-12 mt-8" />
                )}
              </div>
            ))}
          </div>

          {/* 모바일: 세로 배치 */}
          <div className="flex md:hidden flex-col items-center gap-0 landing-scroll-reveal">
            {steps.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-primary flex items-center justify-center mb-3 bg-card">
                    <span
                      className="text-xl text-primary font-semibold"
                      style={{ fontFamily: "var(--font-story)" }}
                    >
                      {step.number}
                    </span>
                  </div>
                  <h3
                    className="text-base font-semibold text-foreground mb-1"
                    style={{ fontFamily: "var(--font-story)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted mb-2">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="step-connector-vertical" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== D. Inspirational Quote Section ===== */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-lg mx-auto landing-scroll-reveal">
          <div className="relative landing-book-cover rounded-2xl p-10 md:p-14">
            <GoldCorners size={28} className="absolute inset-0 pointer-events-none" />

            <div className="landing-quote text-center pt-6">
              <p
                className="text-xl md:text-2xl text-foreground italic leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-story)" }}
              >
                가족의 이야기는<br />
                시간이 지날수록<br />
                더 빛을 발합니다.
              </p>

              <OrnamentDivider className="w-32 mx-auto mb-6" />

              <p
                className="text-sm md:text-base text-foreground/60 leading-relaxed"
                style={{ fontFamily: "var(--font-story)" }}
              >
                지금 시작하지 않으면,<br />
                내일은 오늘의 기억이 사라질지도 모릅니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== E. FAQ Section ===== */}
      <section id="faq" className="py-20 px-4 md:px-8 bg-card/50 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14 landing-scroll-reveal">
            <h2
              className="text-2xl md:text-3xl text-foreground font-semibold mb-3"
              style={{ fontFamily: "var(--font-story)" }}
            >
              자주 묻는 질문
            </h2>
            <p className="text-foreground/60 text-base">
              궁금한 점이 있으시면 확인해보세요.
            </p>
            <OrnamentDivider className="w-48 mx-auto mt-6" />
          </div>

          <div className="space-y-3 landing-scroll-reveal">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-border rounded-xl bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-warm-hover transition-colors"
                >
                  <span className="text-sm font-medium text-foreground pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`faq-answer px-5 pb-4 ${openFaq === i ? "open" : ""}`}
                >
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== F. Final CTA Section ===== */}
      <section className="py-20 px-4 md:px-8 bg-primary/8">
        <div className="max-w-lg mx-auto text-center landing-scroll-reveal">
          <h2
            className="text-2xl md:text-3xl text-foreground font-semibold mb-4 leading-snug"
            style={{ fontFamily: "var(--font-story)" }}
          >
            우리 가족의 이야기,<br />
            지금 시작해보세요.
          </h2>

          <p className="text-foreground/50 mb-8">
            무료로 이용할 수 있습니다.
          </p>

          <a
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-lg font-medium text-lg hover:bg-primary-dark transition-colors warm-shadow"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ===== F. Footer ===== */}
      <footer className="py-10 px-4 text-center">
        <OrnamentDivider className="w-32 mx-auto mb-6" />
        <p
          className="text-sm text-muted mb-2"
          style={{ fontFamily: "var(--font-story)" }}
        >
          우리家 이야기
        </p>
        <p
          className="text-xs text-foreground/40"
          style={{ fontFamily: "var(--font-story)" }}
        >
          가족의 이야기는 영원합니다
        </p>
        <p className="text-xs text-foreground/30 mt-4">
          &copy; 2026 우리家 이야기
        </p>
      </footer>
    </div>
  );
}
