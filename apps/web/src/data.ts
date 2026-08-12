// All homepage imagery is hosted on our own S3 bucket and served via CloudFront.
const CDN = "https://d1gbkf1t88nd2q.cloudfront.net";

export interface SliderItem {
  id: number;
  img: string;
  title: string;
  desc: string;
  bg: string;
  cat: string;
}

export interface Category {
  id: number;
  img: string;
  title: string;
  cat: string;
}

export const sliderItems: SliderItem[] = [
  {
    id: 1,
    img: `${CDN}/slider/hero.jpg`,
    title: " FARMING ASSISTANT",
    desc: "DON'T COMPROMISE ON QUALITY & TASTE!.",
    bg: "f5fafd",
    cat: "",
  },
  {
    id: 2,
    img: `${CDN}/slider/tasty.jpg`,
    title: "TASTY PRODUCTS ",
    desc: "GET FLAT 30% OFF SALE.",
    bg: "fcf1ed",
    cat: "fruits",
  },
  {
    id: 3,
    img: `${CDN}/slider/beef.jpg`,
    title: "FRESH BEEF",
    desc: "GET THE BEST MEAT.",
    bg: "fbf0f4",
    cat: "veggies",
  },
];

export const categories: Category[] = [
  {
    id: 1,
    img: `${CDN}/categories/veggies.jpg`,
    title: "VEGGIES",
    cat: "veggies",
  },
  {
    id: 2,
    img: `${CDN}/categories/cereals.jpg`,
    title: "CEREALS",
    cat: "cereals",
  },
  {
    id: 3,
    img: `${CDN}/categories/fruits.jpg`,
    title: "FRUITS",
    cat: "fruits",
  },
];
