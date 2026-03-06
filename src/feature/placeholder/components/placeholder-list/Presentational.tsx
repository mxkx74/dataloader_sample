import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlaceholderRow } from "../../adapter/selector";

type Props = {
  rows: PlaceholderRow[];
};

export function PlaceholderListPresentational({ rows }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>プレースホルダー一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>タイトル</TableHead>
              <TableHead>ユーザー ID</TableHead>
              <TableHead>完了状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.userId}</TableCell>
                <TableCell>
                  <span
                    className={
                      row.completed ? "text-green-600" : "text-muted-foreground"
                    }
                    aria-label={row.completed ? "完了" : "未完了"}
                  >
                    {row.completed ? "✓ 完了" : "未完了"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
