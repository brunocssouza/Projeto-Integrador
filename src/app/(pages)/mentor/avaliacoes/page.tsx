"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
  id: number;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined text-[16px] ${
            star <= rating ? "text-orange-500" : "text-on-surface-variant/20"
          }`}
          style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function MentorAvaliacoesPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/v1/mentors/${user.id}/avaliacoes`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setReviews(data.reviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-primary mb-1">Avaliações</h1>
        <p className="text-on-surface-variant text-[14px]">
          Veja o que seus alunos estão dizendo, {user?.name?.split(" ")[0]}.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">
            star
          </span>
          <p className="text-on-surface-variant text-[14px]">
            Nenhuma avaliação recebida ainda.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 mb-8 flex items-center gap-8">
            <div className="text-center">
              <p className="text-[40px] font-bold text-primary leading-none">
                {avgRating.toFixed(1)}
              </p>
              <StarRating rating={Math.round(avgRating)} />
              <p className="text-[12px] text-on-surface-variant mt-2">
                {reviews.length} avaliações
              </p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
                const pct = (count / reviews.length) * 100;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-[12px] text-on-surface-variant w-3 text-right">
                      {stars}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-orange-500">
                      star
                    </span>
                    <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[12px] text-on-surface-variant w-6">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-outline-variant/40 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-[12px] font-bold text-primary">
                    {getInitials(review.studentName)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-on-surface">
                      {review.studentName}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {new Date(review.date).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-[14px] text-on-surface-variant leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
