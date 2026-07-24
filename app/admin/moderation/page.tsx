import Link from "next/link";
import { getFeed } from "@/lib/community";
import { getReports } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { formatRelativeTime } from "@/lib/format";
import { removePost, resolveReport } from "./actions";

export default async function AdminModerationPage() {
  const [posts, reports] = await Promise.all([getFeed(), getReports("open")]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-paper">Moderation</h1>
        <p className="mt-1 text-sm text-stone">
          Member reports and community posts.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Reports {reports.length > 0 && `(${reports.length})`}
        </h2>
        {reports.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">No open reports.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-paper">
                    <Link
                      href={`/members/${report.reportedUserId}`}
                      className="hover:text-gold"
                    >
                      {report.reportedName}
                    </Link>{" "}
                    <span className="text-stone">reported by {report.reporterName}</span>
                  </p>
                  <span className="text-xs text-stone">
                    {formatRelativeTime(report.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-paper/90">{report.reason}</p>
                {report.context && (
                  <p className="text-xs text-stone">{report.context}</p>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <form action={resolveReport.bind(null, report.id, "resolved")}>
                    <button
                      type="submit"
                      className="text-xs text-stone transition-colors hover:text-gold"
                    >
                      Mark resolved
                    </button>
                  </form>
                  <form action={resolveReport.bind(null, report.id, "dismissed")}>
                    <button
                      type="submit"
                      className="text-xs text-stone transition-colors hover:text-danger"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Recent posts
        </h2>
        {!posts || posts.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">No posts yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-paper">
                    {post.authorName}
                  </span>
                  <span className="text-xs text-stone">
                    {formatRelativeTime(post.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-paper/90">
                  {post.body}
                </p>
                <form action={removePost.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="text-xs text-stone transition-colors hover:text-danger"
                  >
                    Remove post
                  </button>
                </form>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
