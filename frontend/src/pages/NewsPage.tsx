import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { getNews } from "../api/news";
import type { Article } from "../types";

function timeAgo(unixSeconds: number) {
  const diff = Date.now() / 1000 - unixSeconds;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NewsPage() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: () => getNews().then((r) => r.data),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">News</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-gray-400">No news articles available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article: Article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-amber-400/50 transition-colors group"
            >
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt=""
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4 space-y-2">
                <h2 className="font-semibold group-hover:text-amber-400 line-clamp-2">
                  {article.title}
                </h2>
                {article.body && (
                  <p className="text-sm text-gray-400 line-clamp-3">{article.body}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{timeAgo(article.published_date)}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
