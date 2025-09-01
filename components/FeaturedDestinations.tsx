export default function FeaturedDestinations() {
  const destinations = [
    { name: 'Paris', price: '$899', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
    { name: 'Tokyo', price: '$1299', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
    { name: 'Bali', price: '$799', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {destinations.map((dest) => (
        <div key={dest.name} className="rounded-lg overflow-hidden shadow-lg">
          <img src={dest.image} alt={dest.name} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h3 className="font-bold text-lg">{dest.name}</h3>
            <p className="text-blue-600">From {dest.price}</p>
          </div>
        </div>
      ))}
    </div>
  )
}