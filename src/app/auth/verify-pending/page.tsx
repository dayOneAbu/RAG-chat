import Link from "next/link";

export default function VerifyPending() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-6 text-center pt-16">
      <h1 className="text-2xl font-bold">ኢሜልዎን ያረጋግጡ</h1>
      <p className="text-sm text-muted-foreground">
        እባክዎ የመለያዎን ማረጋገጫ ለመጨረስ ኢሜልዎን ይፈትሹ።
      </p>
      <div className="text-center text-sm">
        <span className="text-muted-foreground">ቀድሞ ተረጋግጧል? </span>
        <Link href="/auth/signin" className="text-primary hover:underline">
          ይግቡ
        </Link>
      </div>
    </div>
  );
}