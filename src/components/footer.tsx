import Link from "next/link";
import { Icons } from "./icons";

export default function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2">
                         <Icons.logo className="h-6" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 md:mt-0">
                        © {new Date().getFullYear()} E-Commers V. All rights reserved.
                    </p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
