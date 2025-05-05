import Image from "next/image";
import AffiliateList from "./components/affiliates/AffiliateList";
import AffiliateStats from "./components/affiliates/AffiliateStats";
import logo from "../public/assets/logo.png";
export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4 text-black">
      <div className="flex justify-center items-center gap-2 mb-6 ">
        <Image src={logo} alt="Logo" width={40} height={40} />
        <span className="text-xl font-bold  text-white italic">
          Universal Web - Afiliados
        </span>
      </div>

      <AffiliateStats />
      <AffiliateList />
    </main>
  );
}
