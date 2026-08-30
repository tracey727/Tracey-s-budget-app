import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    include: { account: { select: { name: true } } },
  });

  const header = ["Date", "Account", "Description", "Amount", "Classification", "Transfer"];
  const rows = transactions.map((t) =>
    [
      t.date.toISOString().slice(0, 10),
      t.account.name,
      t.description,
      t.amount.toString(),
      t.classification ?? "",
      t.isTransfer ? "Yes" : "No",
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="genevieve-transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
