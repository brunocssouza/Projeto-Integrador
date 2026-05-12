"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import Image from "next/image";

gsap.registerPlugin(
  useGSAP,
  Draggable,
  DrawSVGPlugin,
  InertiaPlugin,
  Observer,
  ScrollTrigger,
  SplitText,
);

export default function Home() {
  const boxRef = useRef(null);

  useGSAP(
    () => {
      gsap.from(boxRef.current, {
        scrollTrigger: {
          trigger: boxRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 50,
        duration: 1,

      });
    },
    { scope: boxRef },
  );

  return (
    <main className="min-h-screen text-slate-800">
      {/* Tela inicial */}
      <div ref={boxRef} className="h-screen overflow-x-hidden">
        <span className="size-200 border-6 rounded-full border-orange-500/20 absolute -top-10 -right-4">
          <span className="size-150 rounded-full bg-orange-300/5 absolute -top-4 -right-4"></span>
        </span>

        <div className="w-full flex h-full">
          <div className="w-1/2 flex flex-col justify-center bg-white px-8">
            <h3 className="text-2xl font-sans font-extralight text-black/75 text-justify">
              A insegurança é superada com prática:{" "}
            </h3>
            <h2 className="text-6xl font-sans font-bold mb-12">
              A chave para o mercado de trabalho na palma da sua mão
            </h2>
            <p className="text-2xl font-normal block mb-4">
              Agende simulações de entrevista e fique à frente em processos
              seletivos.
            </p>
            <div className="space-x-4">
              <button className="text-2xl bg-orange-500 rounded-md py-2 transition-all w-4/12 text-white font-sans font-bold hover:bg-orange-600">
                Sou Aluno
              </button>
              <button className="text-2xl border border-orange-500 text-orange-500 rounded-md py-2 transition-all w-4/12 font-sans font-semibold hover:bg-orange-50">
                Sou Mentor
              </button>
            </div>
          </div>
          <div className="w-1/2"></div>
        </div>
      </div>

      {/* Segunda Seção */}
      <div className="flex items-center h-screen bg-blue-200/25">
        <div className="w-full">
          <div className="w-full flex">
            <div className="w-1/2 flex justify-center items-center">
              <Image
                src={"/logo-deslocado.png"}
                width={500}
                height={300}
                sizes="100vw"
                alt="Logo do projeto"
                style={{
                  height: "auto",
                  width: "75%",
                }}
              />
            </div>
            <div className="w-1/2 flex justify-center items-center">
              {/* Conteúdo futuro aqui */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
