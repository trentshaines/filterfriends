import CoffeeShopFinder from "@/components/CoffeeShopFinder";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">FilterFriends</h1>
        <p className="text-gray-600">Find the perfect coffee shop near you</p>
      </header>
      
      <main>
        <CoffeeShopFinder />
      </main>
      
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} FilterFriends. All rights reserved.</p>
      </footer>
    </div>
  );
}
