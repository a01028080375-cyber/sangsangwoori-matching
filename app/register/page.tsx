import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">프로필 등록</h1>
        <p className="mt-2 text-xl text-gray-600">
          회원님의 정보를 입력하시면 알맞은 일자리를 찾아드립니다.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">기본 정보 입력</CardTitle>
          <CardDescription className="text-lg">
            * 표시된 항목은 필수 입력 항목입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6">
            {/* 이름 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-xl font-semibold">
                이름 *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="홍길동"
                className="h-14 text-xl px-4"
                disabled
              />
            </div>

            {/* 지역 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="region" className="text-xl font-semibold">
                거주 지역 *
              </Label>
              <Input
                id="region"
                name="region"
                type="text"
                placeholder="예: 서울 노원구"
                className="h-14 text-xl px-4"
                disabled
              />
            </div>

            {/* 희망 직종 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="desired_job" className="text-xl font-semibold">
                희망 직종 *
              </Label>
              <Input
                id="desired_job"
                name="desired_job"
                type="text"
                placeholder="예: 경비원, 청소원, 요양보호사"
                className="h-14 text-xl px-4"
                disabled
              />
            </div>

            {/* 경력 연수 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="career_years" className="text-xl font-semibold">
                경력 연수 *
              </Label>
              <Input
                id="career_years"
                name="career_years"
                type="number"
                min={0}
                placeholder="예: 5"
                className="h-14 text-xl px-4"
                disabled
              />
              <p className="text-lg text-gray-500">관련 분야 총 경력 연수를 숫자로 입력해 주세요.</p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-16 text-xl font-bold mt-2"
              disabled
            >
              등록하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
