"use client"

import { useState } from "react"
import CoffeeShopCard from "./coffee-shop-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for coffee shops
const COFFEE_SHOPS = [
  {
    id: 1,
    name: "Brew Haven",
    distance: 0.3,
    drinks: 4.5,
    ambience: 4.2,
    studyability: 4.7,
    address: "123 Main St",
    hours: "7am - 8pm",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Coffee Collective",
    distance: 0.7,
    drinks: 4.8,
    ambience: 4.0,
    studyability: 3.5,
    address: "456 Oak Ave",
    hours: "6am - 9pm",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Espresso Elegance",
    distance: 1.2,
    drinks: 4.2,
    ambience: 4.9,
    studyability: 4.3,
    address: "789 Elm Blvd",
    hours: "8am - 7pm",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "Bean Buzz",
    distance: 0.5,
    drinks: 4.0,
    ambience: 3.8,
    studyability: 4.5,
    address: "321 Pine St",
    hours: "7am - 10pm",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
]

type SortOption = "default" | "proximity" | "drinks" | "ambience" | "studyability"

export default function CoffeeShopList() {
  const [sortBy, setSortBy] = useState<SortOption>("default")

  const sortedShops = [...COFFEE_SHOPS].sort((a, b) => {
    switch (sortBy) {
      case "proximity":
        return a.distance - b.distance
      case "drinks":
        return b.drinks - a.drinks
      case "ambience":
        return b.ambience - a.ambience
      case "studyability":
        return b.studyability - a.studyability
      default:
        return 0 // Keep original order
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Found {COFFEE_SHOPS.length} coffee shops nearby</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="proximity">Proximity</SelectItem>
              <SelectItem value="drinks">Drinks</SelectItem>
              <SelectItem value="ambience">Ambience</SelectItem>
              <SelectItem value="studyability">Studyability</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedShops.map((shop) => (
          <CoffeeShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  )
}

