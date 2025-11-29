import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
    return (
        <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full p-3 w-fit">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline mt-4">Order Successful!</CardTitle>
                    <CardDescription className="text-lg">Thank you for your purchase.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        We've received your order and will start processing it right away. You can check the status of your order in your profile.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button asChild>
                            <Link href="/profile">View Orders</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
