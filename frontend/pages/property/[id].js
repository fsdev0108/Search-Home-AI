import { useRouter } from 'next/router';
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PropertyDetail() {
  const router = useRouter();
  const { id } = router.query;

  // Mock data - in real app this would come from API
  const property = {
    id: id || '1',
    title: 'Modern Luxury Villa with Ocean View',
    price: '$2,450,000',
    location: 'Miami Beach, FL',
    address: '123 Ocean Drive, Miami Beach, FL 33139',
    description: 'Stunning modern villa featuring panoramic ocean views, high-end finishes, and luxury amenities. This 4-bedroom, 5-bathroom property offers the perfect blend of comfort and sophistication.',
    features: {
      bedrooms: 4,
      bathrooms: 5,
      area: 4500,
      yearBuilt: 2022,
      parking: 3,
      pool: true,
      garden: true,
      security: true
    },
    images: [
      '/images/hero-luxury.jpg',
      '/images/hero-modern.jpg',
      '/images/hero-house.jpg'
    ],
    amenities: [
      'Private Pool', 'Ocean View', 'Smart Home System', 'Wine Cellar',
      'Home Theater', 'Gourmet Kitchen', 'Walk-in Closets', 'Garden'
    ],
    agent: {
      name: 'Sarah Johnson',
      phone: '+1 (305) 555-0123',
      email: 'sarah.johnson@realestate.com',
      photo: '/images/hero-modern.jpg'
    }
  };

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-background`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/home_icon.png"
                alt="Real Estate Icon"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold text-primary">Real Estate AI</span>
            </Link>
            <Link 
              href="/"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Images */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src={property.images[0]}
                alt={property.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="space-y-4">
            {property.images.slice(1).map((image, index) => (
              <div key={index} className="relative h-32 rounded-xl overflow-hidden">
                <Image
                  src={image}
                  alt={`${property.title} ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Price */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {property.title}
              </h1>
              <p className="text-3xl font-bold text-primary mb-2">
                {property.price}
              </p>
              <p className="text-lg text-muted-foreground">
                📍 {property.address}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-secondary rounded-xl">
                <div className="text-2xl font-bold text-primary">{property.features.bedrooms}</div>
                <div className="text-sm text-muted-foreground">Bedrooms</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-xl">
                <div className="text-2xl font-bold text-primary">{property.features.bathrooms}</div>
                <div className="text-sm text-muted-foreground">Bathrooms</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-xl">
                <div className="text-2xl font-bold text-primary">{property.features.area} sq ft</div>
                <div className="text-sm text-muted-foreground">Area</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-xl">
                <div className="text-2xl font-bold text-primary">{property.features.yearBuilt}</div>
                <div className="text-sm text-muted-foreground">Year Built</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Agent */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Contact Agent</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={property.agent.photo}
                    alt={property.agent.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{property.agent.name}</div>
                  <div className="text-sm text-muted-foreground">Real Estate Agent</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>📞</span>
                  <span>{property.agent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>✉️</span>
                  <span>{property.agent.email}</span>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Contact Agent
              </button>
            </div>

            {/* Property Details */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Property Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type:</span>
                  <span className="font-medium">Villa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-success">For Sale</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parking:</span>
                  <span className="font-medium">{property.features.parking} spaces</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pool:</span>
                  <span className="font-medium">{property.features.pool ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Garden:</span>
                  <span className="font-medium">{property.features.garden ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security:</span>
                  <span className="font-medium">{property.features.security ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
