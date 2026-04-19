import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { getNews } from "../api/news";
import type { Article } from "../types";

function timeAgo(unixSeconds: number) {
  const diff = Date.now() / 1000 - unixSeconds;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function NewsPage() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: () => getNews().then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold gradient-text">News</h1>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-gray-400">No news articles available.</p>
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {articles.map((article: Article) => (
            <motion.a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card glass-card-hover overflow-hidden group"
              variants={fadeUp}
            >
              {article.image_url && (
                <div className="relative overflow-hidden h-44">
                  <img
                    src={article.image_url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <h2 className="font-semibold group-hover:text-amber-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                {article.body && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {article.body}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{timeAgo(article.published_date)}</span>
                  <ExternalLink className="w-3 h-3 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      )}
    </div>
  );
}
