import Image from "next/image";
import Logo from "../assets/logo.png";
import LandingImg from "../assets/main.jpg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        <Image className="max-w-1/12" src={Logo} alt="logo" />
        {/* <div className="text-blue-800">gggg</div> */}
      </header>
      <section className="max-w-6xl mx-auto px-4 sm:px-8 h-screen -mt-20 grid lg:grid-cols-2 items-center">
        <div className="">
          <h1 className="capitalize text-4xl md:text-7xl font-bold">
            Track that application{" "}
            <span className="text-primary"> effortlessly</span>
          </h1>
          <p className="loading-loose max-w-md mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati
            reprehenderit ab cumque dicta ipsam veritatis eum labore amet
            praesentium id????
          </p>
          <Button className="mt-4" asChild>
            <Link href="/add-job">Get Started</Link>
          </Button>
        </div>
        <Image
          src={LandingImg}
          alt="Landing Image"
          className="hidden lg:block"
        />
      </section>
    </main>
  );
}
