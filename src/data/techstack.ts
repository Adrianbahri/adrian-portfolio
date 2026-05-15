import { Database, ShieldCheck, Zap, HardDrive, MousePointerClick, Box } from 'lucide-react';

export const techItems = [
  {
    title: "Postgres Database",
    desc: "Every project is a full Postgres database, the world's most trusted relational database.",
    icon: Database,
    span: "md:col-span-12 xl:col-span-6",
    color: "text-brand"
  },
  {
    title: "Authentication",
    desc: "Add user sign ups and logins, securing your data with RLS.",
    icon: ShieldCheck,
    span: "md:col-span-6 xl:col-span-3"
  },
  {
    title: "Edge Functions",
    desc: "Write custom code without deploying or scaling servers.",
    icon: Zap,
    span: "md:col-span-6 xl:col-span-3"
  },
  {
    title: "Storage",
    desc: "Store, organize, and serve large files like videos and images.",
    icon: HardDrive,
    span: "md:col-span-6 xl:col-span-3"
  },
  {
    title: "Realtime",
    desc: "Build multiplayer experiences with real-time data sync.",
    icon: MousePointerClick,
    span: "md:col-span-6 xl:col-span-3"
  },
  {
    title: "Vector",
    desc: "Integrate ML-models to store and search vector embeddings.",
    icon: Box,
    span: "md:col-span-6 xl:col-span-6"
  }
];
