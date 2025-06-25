import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold gradient-text">Sh*t! Wrong Turn!</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            This page is so not here right now. Maybe it never existed? 🤔
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Let's get you back somewhere less sh*tty.
          </p>
          <a href="/" className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors">
            Go Home
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
