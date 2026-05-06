import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecommendationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">추천 일자리 목록</h1>
        <p className="mt-2 text-xl text-gray-600">
          회원님의 경력과 지역에 맞는 일자리를 점수 순서로 보여드립니다.
        </p>
      </div>

      {/* 필터/정렬 영역 — 기능 구현 예정 */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border">
        <span className="text-lg font-medium text-gray-700">정렬 기준:</span>
        <Badge variant="secondary" className="text-base px-3 py-1">
          매칭 점수 높은 순
        </Badge>
        <span className="ml-auto text-lg text-gray-500">총 0건</span>
      </div>

      {/* 추천 목록 — 기능 구현 시 채워질 자리 */}
      <div className="flex flex-col gap-4">
        <Card className="shadow-sm border-dashed">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-400">
              아직 추천 일자리가 없습니다.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-gray-400">
              먼저{" "}
              <a href="/register" className="text-gray-900 underline font-semibold">
                프로필을 등록
              </a>
              하시면 자동으로 알맞은 일자리를 찾아드립니다.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 추천 카드 예시 레이아웃 (기능 구현 시 map으로 렌더링 예정) */}
      <div className="flex flex-col gap-4 opacity-30 pointer-events-none select-none">
        <p className="text-lg font-semibold text-gray-500 border-b pb-2">
          — 아래는 향후 표시될 카드 레이아웃 예시 —
        </p>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-gray-900">일자리 제목</span>
                <span className="text-lg text-gray-600">지역 · 직종</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className="text-xl px-4 py-1">점수: 95</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
