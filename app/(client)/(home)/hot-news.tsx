/* eslint-disable @next/next/no-img-element */
"use client";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Link from "next/link";

const NewsSlide = ({
  id,
  image,
  title,
  createDate,
}: {
  id: number;
  image: string;
  title: string;
  createDate: string;
}) => {
  return (
    <Link href={`/news/${id}`}>
      <div className="grid grid-cols-2 gap-x-3 relative">
        <div className="h-full">
          <img
            className="w-full aspect-video rounded-sm"
            src={image}
            alt="hot news thumbnail"
          />
        </div>
        <div className="font-mono italic tracking-wide">
          <span className="text-xs text-accent inline-block mb-1">
            {createDate}
          </span>
          <p className="line-clamp-4 text-sm">{title}</p>
        </div>
      </div>
    </Link>
  );
};

const HotNews = () => {
  const hotNewsItems: {
    id: number;
    image: string;
    title: string;
    createDate: string;
  }[] = [
    {
      id: 1,
      image: "https://placehold.co/1600x900?text=Hot+News",
      title: "Team Falcons Juarai DOTA 2 The International 2025",
      createDate: "15 Sep 2025",
    },
    {
      id: 2,
      image: "https://placehold.co/1600x900?text=Hot+News",
      title: "Cara Dapatkan Skin Khufra Cursed Scroll Mobile Legends Gratis",
      createDate: "15 Sep 2025",
    },
    {
      id: 3,
      image: "https://placehold.co/1600x900?text=Hot+News",
      title:
        "Moonton Rilis Skin Juara M6 ONIC PH untuk Joy dan Skin FMVP Beatrix",
      createDate: "15 Sep 2025",
    },
    {
      id: 4,
      image: "https://placehold.co/1600x900?text=Hot+News",
      title: "Cara Mendapatkan Galactic Bunny Bundle Free Fire",
      createDate: "15 Sep 2025",
    },
    {
      id: 5,
      image: "https://placehold.co/1600x900?text=Hot+News",
      title: "PMSL SEA Fall 2025, Tim Peserta, Jadwal, dan Format Turnamen",
      createDate: "15 Sep 2025",
    },
    {
      id: 6,
      image: "https://placehold.co/1600x900?text=Hot+News",
      title: "Tim Peserta, Jadwal, dan Format Turnamen FFWS SEA Fall 2025",
      createDate: "15 Sep 2025",
    },
  ];

  return (
    <section className="mb-12">
      <Swiper
        modules={[Autoplay]}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        spaceBetween={20}
        breakpoints={{
          0: {
            slidesPerView: 1, // mobile
          },
          640: {
            slidesPerView: 2, // tablet kecil
          },
          1024: {
            slidesPerView: 3, // desktop
          },
          1500: {
            slidesPerView: 4,
          },
        }}
      >
        {hotNewsItems.map((item) => (
          <SwiperSlide className="flex items-center" key={item.id}>
            <NewsSlide {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HotNews;
