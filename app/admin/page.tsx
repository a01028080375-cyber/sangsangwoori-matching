import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_TABS = [
  {
    value: "unmatched",
    label: "미매칭",
    badgeClass: "bg-red-100 text-red-700",
    count: 0,
    emptyMessage: "미매칭 시니어가 없습니다.",
  },
  {
    value: "pending",
    label: "매칭 대기",
    badgeClass: "bg-yellow-100 text-yellow-700",
    count: 0,
    emptyMessage: "매칭 대기 중인 건이 없습니다.",
  },
  {
    value: "completed",
    label: "배정 완료",
    badgeClass: "bg-green-100 text-green-700",
    count: 0,
    emptyMessage: "배정 완료된 건이 없습니다.",
  },
] as const;

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">담당자 대시보드</h1>
        <p className="mt-2 text-xl text-gray-600">
          매칭 현황을 단계별로 확인하고 관리합니다.
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        {STATUS_TABS.map(({ value, label, badgeClass, count }) => (
          <Card key={value} className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
              <Badge className={`text-lg px-4 py-1 ${badgeClass}`}>{label}</Badge>
              <span className="text-5xl font-bold text-gray-900">{count}</span>
              <span className="text-lg text-gray-500">건</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 탭 목록 */}
      <Tabs defaultValue="unmatched">
        <TabsList className="h-14 gap-2 bg-gray-100 p-1">
          {STATUS_TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="text-xl font-semibold px-6 h-12 data-[state=active]:bg-white data-[state=active]:shadow"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map(({ value, emptyMessage }) => (
          <TabsContent key={value} value={value} className="mt-4">
            <Card className="shadow-sm border-dashed">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-400">
                  {emptyMessage}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-gray-400">
                  매칭이 처리되면 이곳에 목록이 표시됩니다.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
