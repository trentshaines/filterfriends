import type React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Coffee, Users, BookOpen } from "lucide-react"

interface CoffeeShop {
  id: number
  name: string
  distance: number
  drinks: number
  ambience: number
  studyability: number
  address: string
  hours: string
  imageUrl: string
  rating: number
  userRatingsTotal: number
  openNow?: boolean
  priceLevel?: number
}

interface CoffeeShopCardProps {
  shop: CoffeeShop
}

export default function CoffeeShopCard({ shop }: CoffeeShopCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3 relative h-48 md:h-auto">
          <Image src={shop.imageUrl || "/placeholder.svg"} alt={shop.name} fill className="object-cover" />
        </div>
        <CardContent className="p-4 md:p-6 md:w-2/3">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold">{shop.name}</h3>
            <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">{shop.distance} mi</span>
          </div>

          <div className="flex items-center text-gray-500 mt-2 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{shop.address}</span>
          </div>

          <div className="flex items-center text-gray-500 mt-1 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{shop.hours}</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <RatingItem icon={<Coffee className="h-4 w-4 text-amber-600" />} label="Drinks" rating={shop.drinks} />
            <RatingItem icon={<Users className="h-4 w-4 text-amber-600" />} label="Ambience" rating={shop.ambience} />
            <RatingItem
              icon={<BookOpen className="h-4 w-4 text-amber-600" />}
              label="Study"
              rating={shop.studyability}
            />
          </div>

          {shop.rating && (
            <div className="flex items-center mt-2">
              <span className="text-gray-600 mr-1">Google Rating:</span>
              {renderStars(shop.rating)}
              <span className="ml-1 text-gray-600">
                ({shop.rating.toFixed(1)})
                {shop.userRatingsTotal && ` · ${shop.userRatingsTotal} reviews`}
              </span>
            </div>
          )}

          {shop.openNow !== undefined && (
            <p className={`mt-2 ${shop.openNow ? 'text-green-600' : 'text-red-600'}`}>
              {shop.openNow ? 'Open Now' : 'Closed'}
            </p>
          )}

          {shop.priceLevel !== undefined && (
            <p className="mt-1 text-gray-600">
              Price: {'$'.repeat(shop.priceLevel)}
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

interface RatingItemProps {
  icon: React.ReactNode
  label: string
  rating: number
}

function RatingItem({ icon, label, rating }: RatingItemProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-1">
        {icon}
        <span className="ml-1 text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center">
        <span className="text-sm font-bold">{rating.toFixed(1)}</span>
        <span className="text-xs text-gray-500">/5</span>
      </div>
    </div>
  )
}

function renderStars(rating: number): React.ReactNode {
  const stars = Math.round(rating * 5)
  return (
    <span>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < stars ? 'text-amber-400' : 'text-gray-300'}>★</span>
      ))}
    </span>
  )
}

