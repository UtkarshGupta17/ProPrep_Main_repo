import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div>
    <h1 class="text-3xl font-bold mb-4">Hello user !</h1>
    <a href="./dashboard" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block mr-2 mb-2">Give Mock Interview</a>
    <a href="https://pro-prep-resume-builder.vercel.app/" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-block mb-2">Build Your Resume</a>
</div>

  );
}
