import { Coffee } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Coffee className="h-6 w-6 text-amber-600" />
            <span className="text-xl font-bold">FilterFriends</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

